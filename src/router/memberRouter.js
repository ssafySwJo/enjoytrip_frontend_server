const memberRouter = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue')
  },

  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue')
  }
]

export default memberRouter
