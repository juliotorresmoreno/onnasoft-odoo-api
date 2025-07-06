import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Plan } from '@/entities/Plan';
import { PlanTranslation } from '@/entities/PlanTranslation';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Configuration } from '@/types/configuration';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @Inject() private readonly configService: ConfigService,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(PlanTranslation)
    private readonly planTranslationRepository: Repository<PlanTranslation>,
  ) {}

  async onApplicationBootstrap() {
    const config = this.configService.get('config') as Configuration;

    const starterPlan = {
      id: '95e60216-624e-42f8-ae7a-10a824b7b00e',
      name: config.plans.starter.name,
      description: 'For individuals and freelancers',
      price: config.plans.starter.price,
      anualPrice: config.plans.starter.anualPrice,
      stripeAnualPriceId: config.plans.starter.anualId,
      stripePriceId: config.plans.starter.id,
      active: true,
    };

    const businessPlan = {
      id: '305ca76f-b719-480e-bccd-3847fa6766d1',
      name: config.plans.business.name,
      description: 'For small and medium businesses',
      price: config.plans.business.price,
      anualPrice: config.plans.business.anualPrice,
      stripeAnualPriceId: config.plans.business.anualId,
      stripePriceId: config.plans.business.id,
      active: true,
    };

    const enterprisePlan = {
      id: '70c5df85-080d-49a1-80af-62903ee8e1d0',
      name: config.plans.enterprise.name,
      description: 'For large enterprises and organizations',
      price: config.plans.enterprise.price,
      anualPrice: config.plans.enterprise.anualPrice,
      stripeAnualPriceId: config.plans.enterprise.anualId,
      stripePriceId: config.plans.enterprise.id,
      active: true,
    };

    await this.planRepository.save([starterPlan, businessPlan, enterprisePlan]);

    await this.planTranslationRepository.save([
      {
        id: '13607d4a-9cc5-4aad-b161-1b74e52d233c',
        locale: 'en',
        description:
          'Ideal for individuals and small startups starting their Odoo journey.',
        features: [
          'Essential Odoo Modules (CRM, Sales, Basic Accounting)',
          'Standard Email/Chat Support (Mon-Fri, 9 AM - 5 PM COL)',
          '10 GB Storage',
          'Online Knowledge Base & Video Tutorials',
          'Self-guided Implementation',
        ],
        plan: starterPlan,
      },
      {
        id: '4bbbd0e3-b21a-4e79-8736-88a2d34b93c5',
        locale: 'es',
        description:
          'Ideal para individuos y startups pequeñas que inician su camino con Odoo.',
        features: [
          'Módulos Esenciales de Odoo (CRM, Ventas, Contabilidad Básica)',
          'Soporte Estándar por Email/Chat (Lun-Vie, 9 AM - 5 PM COL)',
          '10 GB de Almacenamiento',
          'Base de Conocimiento en Línea y Tutoriales en Video',
          'Auto-implementación Guiada',
        ],
        plan: starterPlan,
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
          '50 GB Storage',
          'Exclusive Webinars & Group Q&A Sessions',
          'Assistance with Initial Configuration',
        ],
        plan: businessPlan,
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
          '50 GB de Almacenamiento',
          'Webinars Exclusivos y Sesiones Grupales de Preguntas y Respuestas',
          'Asistencia en la Configuración Inicial',
        ],
        plan: businessPlan,
      },

      {
        id: 'affae968-f431-4cff-9a26-3f0052689e90',
        locale: 'en',
        description:
          'The complete solution for large enterprises requiring expert implementation and comprehensive features.',
        features: [
          'All Business Plan Features',
          'Manufacturing (MRP) & Quality Control',
          'Advanced Point of Sale (PoS)',
          'Full HR (Payroll, Recruitment) & Multi-Company Support',
          'Premium 24/7 Support (Email/Chat/Phone)',
          'Dedicated Account Manager & Strict SLAs',
          '200 GB Storage (Scalable)',
          'Personalized Consulting & Training Hours (e.g., 10-20 hrs/month)',
          'Direct Implementation Assistance & Data Migration',
          'Live Team Training Sessions',
          'Custom Module Configuration & Workflow Adjustment',
          'Staging Environment for Validation',
        ],
        plan: enterprisePlan,
      },
      {
        id: 'f67a685d-8be6-4036-a628-964646047207',
        locale: 'es',
        description:
          'La solución completa para grandes empresas que requieren implementación experta y funcionalidades integrales.',
        features: [
          'Todas las Características del Plan Empresarial',
          'Fabricación (MRP) y Control de Calidad',
          'Punto de Venta (PoS) Avanzado',
          'RRHH Completo (Nómina, Reclutamiento) y Soporte Multi-Compañía',
          'Soporte Premium 24/7 (Email/Chat/Teléfono)',
          'Gestor de Cuenta Dedicado y SLAs Estrictos',
          '200 GB de Almacenamiento (Escalable)',
          'Horas de Consultoría y Capacitación Personalizadas (ej. 10-20 hrs/mes)',
          'Asistencia Directa en la Implementación y Migración de Datos',
          'Sesiones de Capacitación en Vivo para Equipos',
          'Configuración Personalizada de Módulos y Ajuste de Flujos de Trabajo',
          'Entorno de Pruebas (Staging) para Validación',
        ],
        plan: enterprisePlan,
      },
    ]);
  }
}
