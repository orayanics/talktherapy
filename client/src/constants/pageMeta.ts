export interface PageMeta {
  title: string
  description?: string
}

type PageMetaTree = PageMeta & {
  children?: Record<string, PageMetaTree>
}

export const PAGE_META = {
  dashboard: {
    title: 'Dashboard',
    description: 'View your account overview and recent activity.',
  },
  profile: {
    title: 'Profile',
    description: 'View and manage your account details.',
    children: {
      edit: {
        title: 'Edit profile',
        description: 'Update your personal and contact information.',
      },
      confirmEmail: {
        title: 'Confirm email',
        description: 'Confirm the email address for your account.',
      },
    },
  },
  administration: {
    title: 'Administration',
    description: 'Manage application settings and accounts.',
    children: {
      diagnoses: {
        title: 'Diagnoses',
        description: 'Manage the diagnoses available for clinical records.',
      },
      logs: {
        title: 'Activity logs',
        description: 'Review recorded activity across the application.',
      },
      notifications: {
        title: 'Notifications',
        description: 'Create and send notifications to users.',
      },
      users: {
        title: 'Users',
        description: 'View and manage user accounts.',
      },
    },
  },
  patients: {
    title: 'Patients',
    description: 'View and manage your patient list.',
    children: {
      details: {
        title: 'Patient details',
        description: 'Review patient information and clinical history.',
      },
      createRecord: {
        title: 'Create patient record',
        description: 'Add a clinical record for this patient.',
      },
    },
  },
  schedules: {
    title: 'Schedules',
    description: 'View and manage your available appointment schedules.',
    children: {
      create: {
        title: 'Create schedule',
        description: 'Add a new appointment schedule.',
      },
    },
  },
  bookAppointment: {
    title: 'Book appointment',
    description: 'Find an available schedule and book an appointment.',
  },
  records: {
    title: 'Records',
    description: 'View your clinical records.',
    children: {
      details: {
        title: 'Record details',
        description: 'Review the details of this clinical record.',
      },
    },
  },
  speechPractice: {
    title: 'Speech practice',
    description: 'Complete speech and language practice activities.',
  },
  appointments: {
    title: 'Appointments',
    description: 'View and manage your appointments.',
  },
  content: {
    title: 'Content',
    description: 'Browse educational and therapeutic content.',
    children: {
      details: {
        title: 'Content details',
        description: 'Read this educational or therapeutic resource.',
      },
      create: {
        title: 'Create content',
        description: 'Publish a new educational or therapeutic resource.',
      },
      edit: {
        title: 'Edit content',
        description: 'Update this educational or therapeutic resource.',
      },
    },
  },
  slp: {
    title: 'Speech and language practice',
    description: 'Manage speech and language practice activities.',
    children: {
      assignments: {
        title: 'SLP assignments',
        description: 'View and manage assigned speech practice.',
      },
      exercises: {
        title: 'SLP exercises',
        description: 'Browse speech and language exercises.',
        children: {
          create: {
            title: 'Create SLP exercise',
            description: 'Add a speech and language exercise.',
          },
        },
      },
    },
  },
} as const satisfies Record<string, PageMetaTree>
