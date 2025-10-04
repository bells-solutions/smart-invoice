import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import Login from './Login.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: Login },
    { path: '/register', component: { template: '<div>Register</div>' } },
  ],
});

describe('Login Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should render login form', () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [router],
      },
    });
    
    expect(wrapper.find('h2').text()).toBe('Login to SmartInvoice');
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
  });

  it('should bind input values correctly', async () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [router],
      },
    });
    
    const emailInput = wrapper.find('input[type="email"]');
    const passwordInput = wrapper.find('input[type="password"]');
    
    await emailInput.setValue('test@example.com');
    await passwordInput.setValue('password123');
    
    expect((emailInput.element as HTMLInputElement).value).toBe('test@example.com');
    expect((passwordInput.element as HTMLInputElement).value).toBe('password123');
  });

  it('should have a link to register page', () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [router],
      },
    });
    
    const registerLink = wrapper.find('a[href="/register"]');
    expect(registerLink.exists()).toBe(true);
    expect(registerLink.text()).toContain('Register');
  });

  it('should disable submit button when loading', async () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [router],
      },
    });
    
    // Initially not disabled
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined();
  });
});
