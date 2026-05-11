import { getDb, newId } from './index'

export function seedDemoData () {
  try {
    const db = getDb()

    // Check if data already exists
    const existing = db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number }
    if (existing.count > 0) return

    const projectId = newId()

    // Create demo project
    db.prepare(`
      INSERT INTO projects (id, name, industry, duration_estimate, budget_estimate, methodology, structured_context_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      projectId,
      'E-Commerce Platform Migration',
      'Technology',
      '6 months',
      '$250,000',
      'Agile',
      JSON.stringify({
        description: 'Migrate legacy e-commerce system to modern microservices',
        stakeholders: ['CTO', 'Product Manager', 'Operations'],
        risks: ['Data migration complexity', 'User downtime', 'Third-party integrations']
      }),
      new Date().toISOString()
    )

    // Create demo artifacts
    const demoCharter = {
      name: 'E-Commerce Platform Migration',
      scope: 'Migrate legacy monolithic e-commerce system to modern microservices architecture',
      objectives: [
        'Reduce system latency by 40%',
        'Improve scalability for 10x traffic',
        'Enable independent feature releases'
      ],
      deliverables: [
        'Microservices architecture design',
        'Data migration strategy',
        'API layer implementation',
        'Deployment pipeline'
      ],
      milestones: [
        { name: 'Architecture Design', date: '2026-06-30' },
        { name: 'Core Services Implementation', date: '2026-08-31' },
        { name: 'Data Migration', date: '2026-10-31' },
        { name: 'Go-Live', date: '2026-11-30' }
      ]
    }

    const demoRisk = {
      risks: [
        {
          description: 'Data loss during migration',
          probability: 'Low',
          impact: 'Critical',
          severity: 'High',
          mitigation: 'Comprehensive backup and rollback procedures'
        },
        {
          description: 'Performance degradation',
          probability: 'Medium',
          impact: 'High',
          severity: 'High',
          mitigation: 'Load testing and optimization'
        }
      ]
    }

    db.prepare(`
      INSERT INTO artifacts (id, project_id, type, content_json, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      newId(),
      projectId,
      'charter',
      JSON.stringify(demoCharter),
      new Date().toISOString()
    )

    db.prepare(`
      INSERT INTO artifacts (id, project_id, type, content_json, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      newId(),
      projectId,
      'risk_register',
      JSON.stringify(demoRisk),
      new Date().toISOString()
    )

    console.log('✅ Demo data seeded')
  } catch (e) {
    console.error('Seed error:', e)
  }
}
