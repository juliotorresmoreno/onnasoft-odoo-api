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
    try {
      const existingUser = await this.usersService.findOne({
        where: { email: payload.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already registered');
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
        message:
          'Registration successful. Please check your email to verify your account.',
      };
    } catch (error) {
      this.logger.error(
        `Error during registration: ${error.message}`,
        error.stack,
      );

      if (error instanceof ConflictException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Registration failed. Please try again later.',
      );
    }
  }

  async forgotPassword(email: string) {
    try {
      const user = await this.usersService.findOne({
        where: { email },
        select: ['id', 'email', 'firstName', 'lastName', 'language'],
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

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
        message: 'Password reset link sent to your email',
        user,
      };
    } catch (error) {
      this.logger.error(
        `Error during forgot password for email ${email}: ${error.message}`,
        error.stack,
      );

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to process forgot password request. Please try again later.',
      );
    }
  }

  async validateUser(email: string, password: string) {
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
        ],
      });

      if (!user) {
        return null;
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return null;
      }

      if (!user.isEmailVerified) {
        throw new UnauthorizedException('Email not verified');
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
        message: 'Login successful',
      };
    } catch (error) {
      this.logger.error(
        `Error during login for email ${email}: ${error.message}`,
        error.stack,
      );

      if (error instanceof UnauthorizedException) {
        throw error;
      }
    }

    return null;
  }

  async verifyEmail(token: string) {
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
        throw new UnauthorizedException('Invalid verification token');
      }

      if (!user.verificationTokenExpiresAt) {
        throw new UnauthorizedException('Verification token not found');
      }

      if (user.verificationTokenExpiresAt < new Date()) {
        throw new UnauthorizedException('Verification token expired');
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
        throw error;
      }
    }
  }

  async resendVerification(email: string) {
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
        ],
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.isEmailVerified) {
        throw new ConflictException('Email already verified');
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
        message: 'Verification email resent successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error during resend verification for email ${email}: ${error.message}`,
        error.stack,
      );

      if (
        error instanceof UnauthorizedException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to resend verification email. Please try again later.',
      );
    }
  }

  async resetPassword(token: string, newPassword: string) {
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
        throw new UnauthorizedException('Invalid reset token');
      }

      if (!user.passwordResetTokenExpiresAt) {
        throw new UnauthorizedException('Reset token not found');
      }

      if (user.passwordResetTokenExpiresAt < new Date()) {
        throw new UnauthorizedException('Reset token expired');
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
        message: 'Password successfully reset',
      };
    } catch (error) {
      this.logger.error(
        `Error during password reset with token ${token}: ${error.message}`,
        error.stack,
      );

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to reset password. Please try again later.',
      );
    }
  }

  login(user: User) {
    const payload = { email: user.email, sub: user.id, role: Role.User };

    const access_token = this.jwtService.sign(payload, {
      expiresIn: '1h',
    });

    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: '30d',
    });

    return { access_token, refresh_token };
  }

  refreshToken(user: User) {
    const payload = { email: user.email, sub: user.id, role: Role.User };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1h',
    });

    return {
      access_token: accessToken,
    };
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
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async loginOAuth(token: string) {
    try {
      const decoded: OauthIdTokenPayload = await this.verifyToken(token);

      if (!decoded || !decoded.email) {
        throw new UnauthorizedException('Invalid Google token payload');
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
        throw new UnauthorizedException('User not found');
      } else if (!user.isEmailVerified) {
        throw new ConflictException('Email not verified');
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

      if (
        error instanceof UnauthorizedException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'OAuth login failed. Please try again later.',
      );
    }
  }
}
