import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Plan } from '@/entities/Plan';
import { PlanTranslation } from '@/entities/PlanTranslation';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Configuration } from '@/types/configuration';
import { StripeService } from '@/resources/stripe/stripe.service';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @Inject() private readonly configService: ConfigService,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(PlanTranslation)
    private readonly planTranslationRepository: Repository<PlanTranslation>,
    private readonly stripeService: StripeService,
  ) {}

  async onApplicationBootstrap() {
    const config = this.configService.get('config') as Configuration;

    const profesionalPlan = await this.stripeService.getProductPrice(
      config.plans.professional.id,
    );
    const professionalAnualPlan = await this.stripeService.getProductPrice(
      config.plans.professional.anualId,
    );
    const businessPlan = await this.stripeService.getProductPrice(
      config.plans.business.id,
    );
    const businessAnualPlan = await this.stripeService.getProductPrice(
      config.plans.business.anualId,
    );

    const profesionalPlanMonth = this.planRepository.create({
      id: '95e60216-624e-42f8-ae7a-10a824b7b00e',
      name: profesionalPlan.metadata.name,
      description: profesionalPlan.metadata.description,
      price: (profesionalPlan.unit_amount as number) / 100,
      stripePriceId: config.plans.professional.id,
      period: 'month',
      storage: 50,
      active: true,
    });

    const profesionalPlanYear = this.planRepository.create({
      id: '5c127079-e577-4780-bb6e-cb1872745807',
      name: professionalAnualPlan.metadata.name,
      description: professionalAnualPlan.metadata.description,
      price: (professionalAnualPlan.unit_amount as number) / 100,
      stripePriceId: config.plans.professional.anualId,
      period: 'year',
      storage: 50,
      active: true,
    });

    const businessPlanMonth = this.planRepository.create({
      id: '305ca76f-b719-480e-bccd-3847fa6766d1',
      name: businessPlan.metadata.name,
      description: businessPlan.metadata.description,
      price: (businessPlan.unit_amount as number) / 100,
      stripePriceId: config.plans.business.id,
      period: 'month',
      storage: 200,
      active: true,
    });

    const businessPlanYear = this.planRepository.create({
      id: '023b516d-94bb-43b4-b945-a5ef04e52b48',
      name: businessAnualPlan.metadata.name,
      description: businessAnualPlan.metadata.description,
      price: (businessAnualPlan.unit_amount as number) / 100,
      stripePriceId: config.plans.business.anualId,
      period: 'year',
      storage: 200,
      active: true,
    });

    const enterprisePlanMonth = this.planRepository.create({
      id: '70c5df85-080d-49a1-80af-62903ee8e1d0',
      name: 'Enterprise',
      description: 'For large enterprises and organizations (Monthly)',
      price: 0,
      period: 'month',
      storage: 0,
      active: false,
    });

    const enterprisePlanYear = this.planRepository.create({
      id: 'e5ab91ec-65ba-42a3-bc07-c9fbcdb945b9',
      name: 'Enterprise',
      description: 'For large enterprises and organizations (Annually)',
      price: 0,
      period: 'year',
      storage: 0,
      active: false,
    });

    await this.planRepository.save([
      profesionalPlanMonth,
      profesionalPlanYear,
      businessPlanMonth,
      businessPlanYear,
      enterprisePlanMonth,
      enterprisePlanYear,
    ]);

    await this.planTranslationRepository.save([
      {
        id: '13607d4a-9cc5-4aad-b161-1b74e52d233c',
        locale: 'en',
        description:
          'Ideal for individuals and small startups starting their Odoo journey.',
        features: [
          'Essential Odoo Modules (CRM, Sales, Basic Accounting)',
          'Standard Email/Chat Support (Mon-Fri, 9 AM - 5 PM COL)',
          '50 GB Storage',
          'Online Knowledge Base & Video Tutorials',
          'Self-guided Implementation',
        ],
        plan: profesionalPlanMonth,
      },
      {
        id: '4bbbd0e3-b21a-4e79-8736-88a2d34b93c5',
        locale: 'es',
        description:
          'Ideal para individuos y startups pequeñas que inician su camino con Odoo.',
        features: [
          'Módulos Esenciales de Odoo (CRM, Ventas, Contabilidad Básica)',
          'Soporte Estándar por Email/Chat (Lun-Vie, 9 AM - 5 PM COL)',
          '50 GB de Almacenamiento',
          'Base de Conocimiento en Línea y Tutoriales en Video',
          'Auto-implementación Guiada',
        ],
        plan: profesionalPlanMonth,
      },
      {
        id: '050dab40-e9d0-4bb2-88f2-24e5f9e613fe',
        locale: 'en',
        description:
          'Ideal for individuals and small startups starting their Odoo journey.',
        features: [
          'Essential Odoo Modules (CRM, Sales, Basic Accounting)',
          'Standard Email/Chat Support (Mon-Fri, 9 AM - 5 PM COL)',
          '50 GB Storage',
          'Online Knowledge Base & Video Tutorials',
          'Self-guided Implementation',
        ],
        plan: profesionalPlanYear,
      },
      {
        id: '112dfd35-d59c-4fea-a4b5-e55b1d6a0438',
        locale: 'es',
        description:
          'Ideal para individuos y startups pequeñas que inician su camino con Odoo.',
        features: [
          'Módulos Esenciales de Odoo (CRM, Ventas, Contabilidad Básica)',
          'Soporte Estándar por Email/Chat (Lun-Vie, 9 AM - 5 PM COL)',
          '50 GB de Almacenamiento',
          'Base de Conocimiento en Línea y Tutoriales en Video',
          'Auto-implementación Guiada',
        ],
        plan: profesionalPlanYear,
      },

      {
        id: '4d6b2971-3cd8-4d67-9140-7b767897824b',
        locale: 'en',
        description:
          'Designed for growing small to medium businesses seeking process optimization.',
        features: [
          'All Starter Plan Features',
          'Advanced Inventory Management & Warehousing',
          'Project Management & Timesheets',
          'Basic HR (Employees) & Marketing Automation',
          'Priority Email/Chat Support (Mon-Fri, 8 AM - 6 PM COL)',
          '200 GB Storage',
          'Exclusive Webinars & Group Q&A Sessions',
          'Assistance with Initial Configuration',
        ],
        plan: businessPlanMonth,
      },
      {
        id: 'b8569875-5f8f-4e65-ac40-bd0f4f6fa30a',
        locale: 'es',
        description:
          'Diseñado para pequeñas y medianas empresas en crecimiento que buscan optimizar procesos.',
        features: [
          'Todas las Características del Plan Básico',
          'Gestión de Inventario Avanzada y Almacenes',
          'Gestión de Proyectos y Hojas de Tiempo',
          'RRHH Básico (Empleados) y Automatización de Marketing',
          'Soporte Prioritario por Email/Chat (Lun-Vie, 8 AM - 6 PM COL)',
          '200 GB de Almacenamiento',
          'Webinars Exclusivos y Sesiones Grupales de Preguntas y Respuestas',
          'Asistencia en la Configuración Inicial',
        ],
        plan: businessPlanMonth,
      },
      {
        id: '95f90766-eff5-4bd3-8053-5ebb2523c21f',
        locale: 'en',
        description:
          'Designed for growing small to medium businesses seeking process optimization.',
        features: [
          'All Starter Plan Features',
          'Advanced Inventory Management & Warehousing',
          'Project Management & Timesheets',
          'Basic HR (Employees) & Marketing Automation',
          'Priority Email/Chat Support (Mon-Fri, 8 AM - 6 PM COL)',
          '200 GB Storage',
          'Exclusive Webinars & Group Q&A Sessions',
          'Assistance with Initial Configuration',
        ],
        plan: businessPlanYear,
      },
      {
        id: 'faf15a5d-7275-4f20-b138-ce20bf3c63c3',
        locale: 'es',
        description:
          'Diseñado para pequeñas y medianas empresas en crecimiento que buscan optimizar procesos.',
        features: [
          'Todas las Características del Plan Básico',
          'Gestión de Inventario Avanzada y Almacenes',
          'Gestión de Proyectos y Hojas de Tiempo',
          'RRHH Básico (Empleados) y Automatización de Marketing',
          'Soporte Prioritario por Email/Chat (Lun-Vie, 8 AM - 6 PM COL)',
          '200 GB de Almacenamiento',
          'Webinars Exclusivos y Sesiones Grupales de Preguntas y Respuestas',
          'Asistencia en la Configuración Inicial',
        ],
        plan: businessPlanYear,
      },

      {
        id: 'affae968-f431-4cff-9a26-3f0052689e90',
        locale: 'en',
        description:
          'The complete solution for large enterprises requiring expert implementation and comprehensive features.',
        features: [
          'All Business Plan Features',
          'Premium 24/7 Support (Email/Chat/Phone)',
          'Dedicated Account Manager & Strict SLAs',
          'Custom Storage Allocation (Scalable as Needed)',
          'Personalized Consulting & Training Hours',
          'Direct Implementation Assistance & Data Migration',
          'Live Team Training Sessions',
          'Custom Module Configuration & Workflow Adjustment',
          'Staging Environment for Validation',
          'Additional Integrations & Enterprise-Specific Needs',
        ],
        plan: enterprisePlanMonth,
      },
      {
        id: 'f67a685d-8be6-4036-a628-964646047207',
        locale: 'es',
        description:
          'La solución completa para grandes empresas que requieren implementación experta y funcionalidades integrales.',
        features: [
          'Todas las Características del Plan Empresarial',
          'Soporte Premium 24/7 (Email/Chat/Teléfono)',
          'Gestor de Cuenta Dedicado y SLAs Estrictos',
          'Almacenamiento Personalizado (Escalable según necesidades)',
          'Horas de Consultoría y Capacitación Personalizadas',
          'Asistencia Directa en la Implementación y Migración de Datos',
          'Sesiones de Capacitación en Vivo para Equipos',
          'Configuración Personalizada de Módulos y Ajuste de Flujos de Trabajo',
          'Entorno de Pruebas (Staging) para Validación',
          'Integraciones Adicionales y Requisitos Específicos para Empresas',
        ],
        plan: enterprisePlanMonth,
      },
      {
        id: '856af024-6eb3-4390-b261-08b3299bd496',
        locale: 'en',
        description:
          'Tailored for large enterprises. This plan is negotiated individually and includes custom resources, consulting, and implementation.',
        features: [
          'All Business Plan Features',
          'Premium 24/7 Support (Email/Chat/Phone)',
          'Dedicated Account Manager & Strict SLAs',
          'Custom Storage Allocation (Scalable as Needed)',
          'Personalized Consulting & Training Hours',
          'Direct Implementation Assistance & Data Migration',
          'Live Team Training Sessions',
          'Custom Module Configuration & Workflow Adjustment',
          'Staging Environment for Validation',
          'Additional Integrations & Enterprise-Specific Needs',
        ],
        plan: enterprisePlanYear,
      },
      {
        id: '7b001572-2f7a-4b03-a126-c6d623834e36',
        locale: 'es',
        description:
          'Diseñado para grandes empresas. Este plan se negocia individualmente e incluye recursos personalizados, consultoría y asistencia en implementación.',
        features: [
          'Todas las Características del Plan Empresarial',
          'Soporte Premium 24/7 (Email/Chat/Teléfono)',
          'Gestor de Cuenta Dedicado y SLAs Estrictos',
          'Almacenamiento Personalizado (Escalable según necesidades)',
          'Horas de Consultoría y Capacitación Personalizadas',
          'Asistencia Directa en la Implementación y Migración de Datos',
          'Sesiones de Capacitación en Vivo para Equipos',
          'Configuración Personalizada de Módulos y Ajuste de Flujos de Trabajo',
          'Entorno de Pruebas (Staging) para Validación',
          'Integraciones Adicionales y Requisitos Específicos para Empresas',
        ],
        plan: enterprisePlanYear,
      },
    ]);
  }
}
