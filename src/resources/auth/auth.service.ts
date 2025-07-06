import { JwtService } from '@nestjs/jwt';
import { User } from '@/entities/User';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth.dto';
import {
  comparePassword,
  generateRandomToken,
  hashPassword,
} from '@/utils/secure';
import { UsersService } from '@/resources/users/users.service';
import { EmailService } from '@/services/email/email.service';
import { OauthIdTokenPayload } from '@/types/jwt';
import { ConfigService } from '@nestjs/config';
import { Configuration } from '@/types/configuration';
import { Role } from '@/types/role';
import { NotificationsService } from '../notifications/notifications.service';
import { Notification } from '@/entities/Notification';
import { translations } from './translations';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(payload: RegisterAuthDto) {
    const t = translations[payload.language] || translations.en;
    try {
      const existingUser = await this.usersService.findOne({
        where: { email: payload.email },
      });

      if (existingUser) {
        throw new ConflictException(t.register.conflict);
      }

      const hashedPassword = await hashPassword(payload.password);
      const newUser = await this.usersService.create({
        ...payload,
        role: Role.User,
        isEmailVerified: false,
        password: hashedPassword,
      });

      const passwordResetToken = generateRandomToken();
      await this.usersService.update(newUser.id, {
        verificationToken: passwordResetToken,
        verificationTokenExpiresAt: new Date(Date.now() + 3600000 * 24),
      });

      await this.notificationsService.create(
        new Notification({
          title: 'Welcome to ProMeet',
          userId: newUser.id,
          metadata: {
            type: 'welcome',
            message: 'Thank you for registering with ProMeet!',
          },
        }),
      );

      await this.emailService.sendVerificationEmail({
        to: newUser.email,
        name: `${newUser.firstName} ${newUser.lastName}`,
        token: passwordResetToken,
        language: newUser.language || 'en',
      });

      await this.notificationsService.create(
        new Notification({
          title: 'New User Registration',
          userId: newUser.id,
          metadata: {
            type: 'registration',
            message: `New user registered with email: ${newUser.email}`,
          },
        }),
      );

      return {
        message: t.register.success,
      };
    } catch (error) {
      this.logger.error(
        `Error during registration: ${error.message}`,
        error.stack,
      );

      if (error instanceof ConflictException) {
        throw error;
      }

      throw new InternalServerErrorException(t.register.error);
    }
  }

  async forgotPassword(email: string) {
    let t = translations.en;
    try {
      const user = await this.usersService.findOne({
        where: { email },
        select: ['id', 'email', 'firstName', 'lastName', 'language'],
      });

      if (!user) {
        throw new UnauthorizedException(t.forgotPassword.notFound);
      }

      t = translations[user.language] || translations.en;

      const passwordResetToken = generateRandomToken();
      await this.usersService.update(user.id, {
        passwordResetToken: passwordResetToken,
        passwordResetTokenExpiresAt: new Date(Date.now() + 3600000),
      });

      await this.emailService.sendPasswordResetEmail({
        to: user.email,
        token: passwordResetToken,
        language: user.language || 'en',
      });

      await this.notificationsService.create(
        new Notification({
          title: 'Password Reset Requested',
          userId: user.id,
          metadata: {
            type: 'password_reset',
            message: `Password reset requested for email: ${user.email}`,
          },
        }),
      );

      return {
        message: t.forgotPassword.success,
        user,
      };
    } catch (error) {
      this.logger.error(
        `Error during forgot password for email ${email}: ${error.message}`,
        error.stack,
      );

      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(t.forgotPassword.notFound);
      }

      throw new InternalServerErrorException(t.forgotPassword.error);
    }
  }

  async validateUser(email: string, password: string) {
    let t = translations.en;
    try {
      const user = await this.usersService.findOne({
        where: { email },
        select: [
          'id',
          'email',
          'password',
          'firstName',
          'lastName',
          'isEmailVerified',
          'language',
        ],
      });

      if (!user) {
        throw new UnauthorizedException(t.login.notFound);
      }

      t = translations[user.language] || translations.en;

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException(t.login.invalidCredentials);
      }

      if (!user.isEmailVerified) {
        throw new UnauthorizedException(t.login.emailNotVerified);
      }

      await this.notificationsService.create(
        new Notification({
          title: 'User Login',
          userId: user.id,
          metadata: {
            type: 'login',
            message: `User logged in with email: ${user.email}`,
          },
        }),
      );

      return {
        user: await this.usersService.findOne({
          where: { email },
          select: ['id', 'email', 'firstName', 'lastName', 'language'],
        }),
        message: t.login.success,
      };
    } catch (error) {
      this.logger.error(
        `Error during login for email ${email}: ${error.message}`,
        error.stack,
      );

      if (error instanceof UnauthorizedException) {
        if (error.message.includes('not found')) {
          throw new UnauthorizedException(t.login.notFound);
        } else if (error.message.includes('credentials')) {
          throw new UnauthorizedException(t.login.invalidCredentials);
        } else if (error.message.includes('verified')) {
          throw new UnauthorizedException(t.login.emailNotVerified);
        }
        throw error;
      }
    }

    return null;
  }

  async verifyEmail(token: string) {
    let t = translations.en;
    try {
      const user = await this.usersService.findOne({
        where: { verificationToken: token },
        select: [
          'id',
          'email',
          'firstName',
          'lastName',
          'language',
          'verificationTokenExpiresAt',
        ],
      });

      if (!user) {
        throw new UnauthorizedException(t.verifyEmail.invalidToken);
      }

      t = translations[user.language] || translations.en;

      if (!user.verificationTokenExpiresAt) {
        throw new UnauthorizedException(t.verifyEmail.tokenNotFound);
      }

      if (user.verificationTokenExpiresAt < new Date()) {
        throw new UnauthorizedException(t.verifyEmail.tokenExpired);
      }

      await this.usersService.update(user.id, {
        isEmailVerified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
      });

      await this.notificationsService.create(
        new Notification({
          title: 'Email Verified',
          userId: user.id,
          metadata: {
            type: 'email_verification',
            message: `Email verified for user: ${user.email}`,
          },
        }),
      );

      await this.emailService.sendWelcomeEmail({
        to: user.email,
        language: user.language || 'en',
      });
    } catch (error) {
      this.logger.error(
        `Error during email verification with token ${token}: ${error.message}`,
      );

      if (error instanceof UnauthorizedException) {
        if (error.message.includes('invalid')) {
          throw new UnauthorizedException(t.verifyEmail.invalidToken);
        } else if (error.message.includes('expired')) {
          throw new UnauthorizedException(t.verifyEmail.tokenExpired);
        } else if (error.message.includes('not found')) {
          throw new UnauthorizedException(t.verifyEmail.tokenNotFound);
        }
        throw error;
      }
    }
  }

  async resendVerification(email: string) {
    let t = translations.en;

    try {
      const user = await this.usersService.findOne({
        where: { email },
        select: [
          'id',
          'email',
          'firstName',
          'lastName',
          'language',
          'verificationToken',
          'isEmailVerified',
        ],
      });

      if (!user) {
        throw new UnauthorizedException(t.resendVerification.notFound);
      }

      t = translations[user.language] || translations.en;

      if (user.isEmailVerified) {
        throw new ConflictException(t.resendVerification.alreadyVerified);
      }

      const verificationToken = generateRandomToken();
      await this.usersService.update(user.id, {
        verificationToken,
        verificationTokenExpiresAt: new Date(Date.now() + 3600000 * 24),
      });

      await this.emailService.sendVerificationEmail({
        to: user.email,
        name: `${user.firstName} ${user.lastName}`,
        token: verificationToken,
        language: user.language || 'en',
      });

      await this.notificationsService.create(
        new Notification({
          title: 'Verification Email Resent',
          userId: user.id,
          metadata: {
            type: 'verification',
            message: `Verification email resent to: ${user.email}`,
          },
        }),
      );

      return {
        message: t.resendVerification.success,
      };
    } catch (error) {
      this.logger.error(
        `Error during resend verification for email ${email}: ${error.message}`,
        error.stack,
      );

      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(t.resendVerification.notFound);
      } else if (error instanceof ConflictException) {
        throw new ConflictException(t.resendVerification.alreadyVerified);
      }

      throw new InternalServerErrorException(t.resendVerification.error);
    }
  }

  async resetPassword(token: string, newPassword: string) {
    let t = translations.en;
    try {
      const user = await this.usersService.findOne({
        where: { passwordResetToken: token },
        select: [
          'id',
          'email',
          'firstName',
          'lastName',
          'language',
          'passwordResetTokenExpiresAt',
        ],
      });

      if (!user) {
        throw new UnauthorizedException(t.resetPassword.invalidToken);
      }

      t = translations[user.language] || translations.en;

      if (!user.passwordResetTokenExpiresAt) {
        throw new UnauthorizedException(t.resetPassword.tokenNotFound);
      }

      if (user.passwordResetTokenExpiresAt < new Date()) {
        throw new UnauthorizedException(t.resetPassword.tokenExpired);
      }

      const hashedPassword = await hashPassword(newPassword);
      await this.usersService.update(user.id, {
        password: hashedPassword,
        isEmailVerified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
        passwordResetToken: null,
        passwordResetTokenExpiresAt: null,
      });

      await this.notificationsService.create(
        new Notification({
          title: 'Password Reset',
          userId: user.id,
          metadata: {
            type: 'password_reset',
            message: `Password successfully reset for user: ${user.email}`,
          },
        }),
      );

      return {
        message: t.resetPassword.success,
      };
    } catch (error) {
      this.logger.error(
        `Error during password reset with token ${token}: ${error.message}`,
        error.stack,
      );

      if (error instanceof UnauthorizedException) {
        if (error.message.includes('invalid')) {
          throw new UnauthorizedException(t.resetPassword.invalidToken);
        } else if (error.message.includes('expired')) {
          throw new UnauthorizedException(t.resetPassword.tokenExpired);
        } else if (error.message.includes('not found')) {
          throw new UnauthorizedException(t.resetPassword.tokenNotFound);
        }
        throw error;
      }

      throw new InternalServerErrorException(
        translations.en.resetPassword.error,
      );
    }
  }

  async login(user: User, rememberMe: boolean = false) {
    const updateUser = await this.usersService.findOne({
      where: { email: user.email },
    });

    const payload = {
      email: user.email,
      sub: user.id,
      role: updateUser?.role || Role.User,
    };

    const access_token = this.jwtService.sign(payload, {
      expiresIn: rememberMe ? '30d' : '1h',
    });

    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: rememberMe ? '90d' : '30d',
    });

    return { access_token, refresh_token, user: updateUser };
  }

  async refreshToken(user: User) {
    const updateUser = await this.usersService.findOne({
      where: { email: user.email },
    });

    const payload = {
      email: user.email,
      sub: user.id,
      role: updateUser?.role || Role.User,
    };

    const access_token = this.jwtService.sign(payload, {
      expiresIn: '1h',
    });

    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: '30d',
    });

    return { access_token, refresh_token, user: updateUser };
  }

  async verifyToken(token: string) {
    const config = this.configService.get('config') as Configuration;
    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: config.secret,
      });
      return decoded;
    } catch (error) {
      this.logger.error(
        `Token verification failed: ${error.message}`,
        error.stack,
      );
      throw new UnauthorizedException(translations.en.token.invalid);
    }
  }

  async loginOAuth(token: string) {
    const t = translations.en;

    try {
      const decoded: OauthIdTokenPayload = await this.verifyToken(token);

      if (!decoded || !decoded.email) {
        throw new UnauthorizedException(t.oauth.invalidToken);
      }

      const user = await this.usersService.findOne({
        where: { email: decoded.email },
        select: [
          'id',
          'email',
          'firstName',
          'lastName',
          'language',
          'isEmailVerified',
        ],
      });

      if (!user) {
        throw new UnauthorizedException(t.oauth.notFound);
      } else if (!user.isEmailVerified) {
        throw new ConflictException(t.oauth.emailNotVerified);
      }

      await this.notificationsService.create(
        new Notification({
          title: 'OAuth Login',
          userId: user.id,
          metadata: {
            type: 'oauth_login',
            message: `User logged in via OAuth with email: ${user.email}`,
          },
        }),
      );

      return this.refreshToken(user);
    } catch (error) {
      this.logger.error(
        `Error during OAuth login with token ${token}: ${error.message}`,
        error.stack,
      );

      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(t.oauth.notFound);
      } else if (error instanceof ConflictException) {
        throw new ConflictException(t.oauth.emailNotVerified);
      }

      throw new InternalServerErrorException(t.oauth.error);
    }
  }
}
