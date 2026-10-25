/**
 * Authentication Controller
 * Handles Login, Registration, Validation, Role Switching, and UI transitions
 */

const AuthController = {
  currentRole: 'patient', // 'patient' | 'doctor'
  currentMode: 'signin',  // 'signin' | 'signup'

  init() {
    this.cacheElements();
    this.bindEvents();
    this.updateRoleUI();
    this.updateModeUI();
    this.checkExistingSession();
    this.ensureDemoSeed();
  },

  cacheElements() {
    // Containers
    this.authSection = document.getElementById('auth-section');
    this.dashboardSection = document.getElementById('dashboard-section');
    this.toastContainer = document.getElementById('toast-container');

    // Role Buttons
    this.rolePatientBtn = document.getElementById('role-btn-patient');
    this.roleDoctorBtn = document.getElementById('role-btn-doctor');
    this.roleIndicatorText = document.getElementById('role-indicator-text');
    this.roleSubtitle = document.getElementById('role-subtitle');

    // Mode Buttons
    this.modeSigninBtn = document.getElementById('mode-btn-signin');
    this.modeSignupBtn = document.getElementById('mode-btn-signup');

    // Forms
    this.signinForm = document.getElementById('signin-form');
    this.signupForm = document.getElementById('signup-form');

    // Inputs - Signin
    this.signinEmail = document.getElementById('signin-email');
    this.signinPassword = document.getElementById('signin-password');
    this.signinBtn = document.getElementById('signin-submit-btn');

    // Inputs - Signup
    this.signupName = document.getElementById('signup-name');
    this.signupEmail = document.getElementById('signup-email');
    this.signupPassword = document.getElementById('signup-password');
    this.signupConfirm = document.getElementById('signup-confirm-password');
    this.signupPhone = document.getElementById('signup-phone');
    this.signupBtn = document.getElementById('signup-submit-btn');


    // Role specific fields container
    this.doctorFields = document.getElementById('doctor-specific-fields');
    this.patientFields = document.getElementById('patient-specific-fields');

    // Doctor specific inputs
    this.docSpecialization = document.getElementById('doc-specialization');
    this.docLicense = document.getElementById('doc-license');
    this.docHospital = document.getElementById('doc-hospital');

    // Patient specific inputs
    this.patDob = document.getElementById('pat-dob');
    this.patGender = document.getElementById('pat-gender');
    this.patBloodGroup = document.getElementById('pat-bloodgroup');
    this.patEmergency = document.getElementById('pat-emergency');

    // Password strength
    this.strengthBar = document.getElementById('signup-strength-bar');
    this.strengthText = document.getElementById('signup-strength-text');

    // Demo Buttons
    this.demoDoctorBtn = document.getElementById('btn-demo-doctor');
    this.demoPatientBtn = document.getElementById('btn-demo-patient');
  },

  bindEvents() {
    // Role Switchers
    this.rolePatientBtn.addEventListener('click', () => this.setRole('patient'));
    this.roleDoctorBtn.addEventListener('click', () => this.setRole('doctor'));

    // Mode Switchers
    this.modeSigninBtn.addEventListener('click', () => this.setMode('signin'));
    this.modeSignupBtn.addEventListener('click', () => this.setMode('signup'));

    // Form Submissions
    if (this.signinForm) this.signinForm.addEventListener('submit', (e) => this.handleSignin(e));
    if (this.signupForm) this.signupForm.addEventListener('submit', (e) => this.handleSignup(e));
    if (this.signupBtn) this.signupBtn.addEventListener('click', (e) => this.handleSignup(e));

    // Password strength meter on keyup
    this.signupPassword.addEventListener('input', (e) => this.checkPasswordStrength(e.target.value));

    // Show/Hide password toggles
    document.querySelectorAll('.password-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const input = btn.previousElementSibling;
        if (input.type === 'password') {
          input.type = 'text';
          btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
        } else {
          input.type = 'password';
          btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
        }
      });
    });


    // Demo Fill Buttons
    this.demoDoctorBtn.addEventListener('click', () => {
      this.setRole('doctor');
      this.setMode('signin');
      this.signinEmail.value = 'doctor@immu-track.org';
      this.signinPassword.value = 'Doctor@123';
      this.showToast('Demo Doctor credentials loaded! Click Sign In to test.', 'info');
    });

    this.demoPatientBtn.addEventListener('click', () => {
      this.setRole('patient');
      this.setMode('signin');
      this.signinEmail.value = 'patient@immu-track.org';
      this.signinPassword.value = 'Patient@123';
      this.showToast('Demo Patient credentials loaded! Click Sign In to test.', 'info');
    });

    // Setup strict 10-digit phone restrictions
    const phoneInputs = document.querySelectorAll('input[type="tel"], #signup-phone, #sched-phone, #prof-phone');
    phoneInputs.forEach(input => {
      input.setAttribute('maxlength', '10');
      input.setAttribute('inputmode', 'numeric');
      input.setAttribute('pattern', '[0-9]{10}');
      input.setAttribute('placeholder', '10-digit mobile number');

      input.addEventListener('input', (e) => {
        const raw = e.target.value;
        const digits = raw.replace(/\D/g, '');
        if (raw !== digits) {
          e.target.value = digits;
        }
        if (digits.length > 10) {
          e.target.value = digits.slice(0, 10);
          this.showToast('⚠️ Mobile number cannot exceed 10 digits! Higher digits are invalid.', 'error');
          e.target.classList.add('invalid-input');
        } else if (digits.length === 10) {
          e.target.classList.remove('invalid-input');
          e.target.classList.add('valid-input');
        } else {
          e.target.classList.remove('valid-input');
          if (digits.length > 0) {
            e.target.classList.remove('invalid-input');
          }
        }
      });

      input.addEventListener('blur', (e) => {
        const digits = e.target.value.replace(/\D/g, '');
        if (digits.length > 0 && digits.length !== 10) {
          e.target.classList.add('invalid-input');
          e.target.classList.remove('valid-input');
          this.showToast(`⚠️ Invalid entry: Mobile number must be exactly 10 digits (currently ${digits.length} digits).`, 'error');
        } else if (digits.length === 10) {
          e.target.classList.remove('invalid-input');
          e.target.classList.add('valid-input');
        }
      });
    });
  },


  async ensureDemoSeed() {
    try {
      await api.seedDemo();
    } catch (err) {
      console.warn('Auto-seed check note:', err.message);
    }
  },

  setRole(role) {
    if (this.currentRole === role) return;
    this.currentRole = role;
    this.updateRoleUI();
  },

  updateRoleUI() {
    const isDoc = this.currentRole === 'doctor';

    this.roleDoctorBtn.classList.toggle('active', isDoc);
    this.rolePatientBtn.classList.toggle('active', !isDoc);

    if (isDoc) {
      this.roleIndicatorText.textContent = 'Doctor Portal Access';
      this.roleSubtitle.textContent = 'Sign in or register to administer schedules and verify vaccines';
      this.doctorFields.style.display = 'block';
      this.patientFields.style.display = 'none';
      this.signupBtn.textContent = 'Register Doctor Account';
    } else {
      this.roleIndicatorText.textContent = 'Patient Portal Access';
      this.roleSubtitle.textContent = 'Manage immunization schedules, digital passes, and family doses';
      this.doctorFields.style.display = 'none';
      this.patientFields.style.display = 'block';
      this.signupBtn.textContent = 'Create Patient Account';
    }
  },

  setMode(mode) {
    if (this.currentMode === mode) return;
    this.currentMode = mode;
    this.updateModeUI();
  },

  updateModeUI() {
    const isSignin = this.currentMode === 'signin';
    this.modeSigninBtn.classList.toggle('active', isSignin);
    this.modeSignupBtn.classList.toggle('active', !isSignin);

    if (isSignin) {
      this.signinForm.style.display = 'flex';
      this.signupForm.style.display = 'none';
    } else {
      this.signinForm.style.display = 'none';
      this.signupForm.style.display = 'flex';
    }
  },

  handleDocSpecChange(value) {
    const customGroup = document.getElementById('doc-custom-spec-group');
    const customInput = document.getElementById('doc-specialization-custom');
    if (customGroup) {
      if (value === 'Other') {
        customGroup.style.display = 'block';
        if (customInput) customInput.focus();
      } else {
        customGroup.style.display = 'none';
        if (customInput) customInput.value = '';
      }
    }
  },

  handleDocHospitalChange(value) {
    const customGroup = document.getElementById('doc-custom-hospital-group');
    const customInput = document.getElementById('doc-hospital-custom');
    if (customGroup) {
      if (value === 'Other') {
        customGroup.style.display = 'block';
        if (customInput) customInput.focus();
      } else {
        customGroup.style.display = 'none';
        if (customInput) customInput.value = '';
      }
    }
  },

  checkPasswordStrength(password) {
    let score = 0;
    if (!password) {
      this.strengthBar.style.width = '0%';
      this.strengthText.textContent = 'Password security level';
      return;
    }

    if (password.length >= 6) score += 25;
    if (password.length >= 10) score += 25;
    if (/[A-Z]/.test(password)) score += 20;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 15;

    this.strengthBar.style.width = `${Math.min(score, 100)}%`;

    if (score < 40) {
      this.strengthBar.style.background = '#ef4444';
      this.strengthText.textContent = 'Weak password';
      this.strengthText.style.color = '#ef4444';
    } else if (score < 75) {
      this.strengthBar.style.background = '#f59e0b';
      this.strengthText.textContent = 'Medium strength';
      this.strengthText.style.color = '#f59e0b';
    } else {
      this.strengthBar.style.background = '#10b981';
      this.strengthText.textContent = 'Strong security';
      this.strengthText.style.color = '#10b981';
    }
  },

  setLoading(btn, isLoading, loadingText, defaultText) {
    if (!btn) return;
    if (isLoading) {
      if (!btn.dataset.originalText) {
        btn.dataset.originalText = defaultText || btn.textContent.trim() || 'Submit';
      }
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner"></span> ${loadingText || 'Connecting to Server...'}`;
    } else {
      btn.disabled = false;
      btn.innerHTML = defaultText || btn.dataset.originalText || 'Sign In to Portal';
      delete btn.dataset.originalText;
    }
  },

  async handleSignin(e) {
    e.preventDefault();
    const email = this.signinEmail.value.trim();
    const password = this.signinPassword.value;

    if (!email || !password) {
      this.showToast('Please provide both email and password.', 'error');
      return;
    }

    this.setLoading(this.signinBtn, true, 'Signing In...', 'Sign In to Portal');

    try {
      const response = await api.login({
        email,
        password,
        expectedRole: this.currentRole
      });

      this.showToast(response.message || 'Authenticated successfully!', 'success');
      
      // Smooth transition to dashboard
      setTimeout(() => {
        this.renderAuthenticatedApp(response.user);
      }, 400);

    } catch (err) {
      this.showToast(err.message, 'error');
    } finally {
      this.setLoading(this.signinBtn, false, 'Signing In...', 'Sign In to Portal');
    }
  },

  async handleSignup(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (this.isSubmittingSignup) return;

    const btnText = this.currentRole === 'doctor' ? 'Register Doctor Account' : 'Create Patient Account';

    try {
      this.isSubmittingSignup = true;

      const fullName = this.signupName ? this.signupName.value.trim() : '';
      const email = this.signupEmail ? this.signupEmail.value.trim() : '';
      const password = this.signupPassword ? this.signupPassword.value : '';
      const confirmInput = this.signupConfirm || document.getElementById('signup-confirm-password');
      const confirmPassword = confirmInput ? confirmInput.value : '';
      const phone = this.signupPhone ? this.signupPhone.value.trim() : '';

      if (!fullName || !email || !password) {
        this.showToast('Please fill out all required fields (Name, Email, Password).', 'error');
        return;
      }

      if (password.length < 6) {
        this.showToast('Password must have at least 6 characters.', 'error');
        return;
      }

      if (password !== confirmPassword) {
        this.showToast('Passwords do not match. Please verify your confirm password.', 'error');
        return;
      }

      // Strict 10-digit mobile number validation
      if (phone) {
        const digits = phone.replace(/\D/g, '');
        if (digits.length > 10) {
          this.showToast('⚠️ Invalid entry: Mobile number cannot have more than 10 digits.', 'error');
          if (this.signupPhone) {
            this.signupPhone.focus();
            this.signupPhone.classList.add('invalid-input');
          }
          return;
        }
        if (digits.length < 10) {
          this.showToast(`⚠️ Invalid entry: Mobile number must be exactly 10 digits (entered ${digits.length} digits).`, 'error');
          if (this.signupPhone) {
            this.signupPhone.focus();
            this.signupPhone.classList.add('invalid-input');
          }
          return;
        }
      }

      const payload = {
        fullName,
        email,
        password,
        role: this.currentRole,
        phone
      };

      if (this.currentRole === 'doctor') {
        let spec = (this.docSpecialization && this.docSpecialization.value.trim()) ? this.docSpecialization.value.trim() : 'Pediatric Immunization & Preventative Care';
        if (spec === 'Other') {
          const customSpec = document.getElementById('doc-specialization-custom')?.value?.trim();
          if (!customSpec) {
            this.showToast('Please specify your custom department/specialization name.', 'error');
            document.getElementById('doc-specialization-custom')?.focus();
            return;
          }
          spec = customSpec;
        }

        let hosp = (this.docHospital && this.docHospital.value.trim()) ? this.docHospital.value.trim() : 'Swedish Medical Center — Pediatric Specialty Clinic';
        if (hosp === 'Other') {
          const customHosp = document.getElementById('doc-hospital-custom')?.value?.trim();
          if (!customHosp) {
            this.showToast('Please specify your custom hospital/facility name.', 'error');
            document.getElementById('doc-hospital-custom')?.focus();
            return;
          }
          hosp = customHosp;
        }

        payload.specialization = spec;
        payload.licenseNumber = (this.docLicense && this.docLicense.value.trim()) ? this.docLicense.value.trim() : '';
        payload.hospital = hosp;
      } else {
        payload.dob = (this.patDob && this.patDob.value) ? this.patDob.value : null;
        payload.gender = (this.patGender && this.patGender.value) ? this.patGender.value : null;
        payload.bloodGroup = (this.patBloodGroup && this.patBloodGroup.value) ? this.patBloodGroup.value : null;
        payload.emergencyContact = (this.patEmergency && this.patEmergency.value.trim()) ? this.patEmergency.value.trim() : null;
      }

      this.setLoading(this.signupBtn, true, 'Creating Account...');

      const response = await api.register(payload);
      this.showToast(response.message || 'Account created successfully!', 'success');

      setTimeout(() => {
        this.renderAuthenticatedApp(response.user);
      }, 500);

    } catch (err) {
      this.showToast(err.message || 'Registration failed. Please try again.', 'error');
    } finally {
      this.isSubmittingSignup = false;
      this.setLoading(this.signupBtn, false, btnText);
    }
  },

  async checkExistingSession() {
    const token = api.getToken();
    if (!token) return;

    try {
      const meResponse = await api.getMe();
      if (meResponse.user) {
        this.renderAuthenticatedApp(meResponse.user);
      }
    } catch {
      api.clearSession();
    }
  },

  renderAuthenticatedApp(user) {
    this.authSection.style.display = 'none';
    this.dashboardSection.style.display = 'block';
    if (window.DashboardController) {
      window.DashboardController.render(user);
    }
  },

  logout() {
    // Explicitly clear session and reset all buttons & form controllers
    api.clearSession();
    if (this.signinEmail) this.signinEmail.value = '';
    if (this.signinPassword) this.signinPassword.value = '';
    if (this.signinForm) this.signinForm.reset();
    if (this.signupForm) this.signupForm.reset();
    if (this.signupPassword) this.checkPasswordStrength('');

    // Ensure signin button is restored to clean default state (never stuck on 'Signing in...')
    if (this.signinBtn) {
      this.signinBtn.disabled = false;
      this.signinBtn.innerHTML = 'Sign In to Portal';
      delete this.signinBtn.dataset.originalText;
    }
    if (this.signupBtn) {
      this.signupBtn.disabled = false;
      this.signupBtn.innerHTML = this.currentRole === 'doctor' ? 'Register Doctor Account' : 'Create Patient Account';
      delete this.signupBtn.dataset.originalText;
    }

    // Reset phone inputs invalid classes
    document.querySelectorAll('.invalid-input, .valid-input').forEach(el => {
      el.classList.remove('invalid-input', 'valid-input');
    });


    this.setRole('patient');
    this.setMode('signin');
    this.dashboardSection.style.display = 'none';
    this.authSection.style.display = 'flex';
    this.showToast('Signed out successfully. Credentials cleared.', 'info');
  },

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `neo-toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close">&times;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.remove();
    });

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }
};

window.AuthController = AuthController;
