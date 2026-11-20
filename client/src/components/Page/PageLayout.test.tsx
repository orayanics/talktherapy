/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { afterEach, expect, it } from 'vitest'
import { PAGE_META } from '#/constants/pageMeta'
import Breadcrumbs from './Breadcrumbs'
import PageLayout from './PageLayout'

afterEach(cleanup)

it('renders breadcrumb matches as an ordered trail with the current page marked', async () => {
  const rootRoute = createRootRoute({ component: () => <Breadcrumbs /> })
  const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: '_private',
    staticData: {
      page: PAGE_META.dashboard,
      bcLink: '/dashboard',
    },
  })
  const usersRoute = createRoute({
    getParentRoute: () => dashboardRoute,
    path: '/users',
    staticData: {
      page: PAGE_META.administration.children.users,
      bcLink: '/users',
    },
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([
      dashboardRoute.addChildren([usersRoute]),
    ]),
    history: createMemoryHistory({ initialEntries: ['/users'] }),
  })

  await router.load()
  render(<RouterProvider router={router} />)

  const navigation = await screen.findByRole('navigation', {
    name: 'Breadcrumbs',
  })
  expect(navigation.querySelector('ol')).not.toBeNull()
  expect(
    screen
      .getByRole('link', { name: 'Dashboard' })
      .getAttribute('aria-current'),
  ).toBeNull()
  expect(
    screen.getByRole('link', { name: 'Users' }).getAttribute('aria-current'),
  ).toBe('page')
})

it('omits the breadcrumb landmark when no matched route has a label', async () => {
  const rootRoute = createRootRoute({ component: () => <Breadcrumbs /> })
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })

  await router.load()
  render(<RouterProvider router={router} />)

  expect(screen.queryByRole('navigation', { name: 'Breadcrumbs' })).toBeNull()
})

it('renders title, description, and slotted children', () => {
  render(
    <PageLayout
      title={<span>Users</span>}
      description={PAGE_META.administration.children.users.description}
    >
      <button type="button">Invite user</button>
    </PageLayout>,
  )

  expect(screen.getByRole('heading', { level: 1, name: 'Users' })).toBeDefined()
  expect(screen.getByText('View and manage user accounts.')).toBeDefined()
  expect(screen.getByRole('button', { name: 'Invite user' })).toBeDefined()
})
