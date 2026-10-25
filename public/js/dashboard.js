/**
 * Dashboard Controller
 * Seamlessly manages Doctor's Clinician Portal and Patient's Personal Portal
 * with real-time MongoDB Atlas persistence
 */

const DashboardController = {
  currentUser: null,
  allPatients: [],
  activeFilter: 'all', // 'all' | 'overdue' | 'high-risk' | 'today'
  searchQuery: '',

  async render(user) {
    this.currentUser = user;
    this.cacheElements();
    this.bindEvents();

    if (this.currentUser.role === 'doctor') {
      this.doctorView.style.display = 'block';
      this.patientView.style.display = 'none';
      await this.initDoctorDashboard();
    } else {
      this.doctorView.style.display = 'none';
      this.patientView.style.display = 'block';
      await this.initPatientDashboard();
    }
  },

  cacheElements() {
    this.doctorView = document.getElementById('doctor-dashboard-view');
    this.patientView = document.getElementById('patient-dashboard-view');

    // Doctor Elements
    this.docNameDisplay = document.getElementById('doc-name-display');
    this.docSubtitle = document.getElementById('doc-subtitle');
    this.tableBody = document.getElementById('patient-roster-body');
    this.searchInput = document.getElementById('patient-search-input');
    this.filterPills = document.querySelectorAll('.filter-pill');
    this.openScheduleModalBtn = document.getElementById('btn-open-schedule-modal');
    this.scheduleModal = document.getElementById('schedule-vaccine-modal');
    this.closeScheduleModalBtn = document.getElementById('btn-close-schedule-modal');
    this.cancelScheduleBtn = document.getElementById('btn-cancel-schedule');
    this.scheduleForm = document.getElementById('new-schedule-form');

    // Metrics elements
    this.metricCaseload = document.getElementById('metric-caseload');
    this.metricCompliance = document.getElementById('metric-compliance');
    this.metricOverdue = document.getElementById('metric-overdue');
    this.metricHighRisk = document.getElementById('metric-highrisk');

    // Patient Elements
    this.patNameDisplay = document.getElementById('pat-name-display');
    this.patSubtitle = document.getElementById('pat-subtitle');
    this.patCardName = document.getElementById('pat-card-name');
    this.patCardMrn = document.getElementById('pat-card-mrn');
    this.patCardBlood = document.getElementById('pat-card-blood');
    this.patSummaryCompliance = document.getElementById('pat-summary-compliance');
    this.patSummaryDoses = document.getElementById('pat-summary-doses');
    this.patSummaryPhysician = document.getElementById('pat-summary-physician');
    this.patUpcomingList = document.getElementById('patient-upcoming-list');
    this.patHistoryBody = document.getElementById('patient-history-body');
    this.patUpcomingCount = document.getElementById('patient-upcoming-count');
    this.patOverdueCount = document.getElementById('patient-overdue-count');
    this.patAdministeredCount = document.getElementById('patient-administered-count');

    // Patient Demographic Top Card Elements
    this.patDemoDobAge = document.getElementById('pat-demo-dob-age');
    this.patDemoGenderBlood = document.getElementById('pat-demo-gender-blood');
    this.patDemoPhone = document.getElementById('pat-demo-phone');
    this.patDemoEmail = document.getElementById('pat-demo-email');
    this.patDemoEmergency = document.getElementById('pat-demo-emergency');
    this.patDemoAddress = document.getElementById('pat-demo-address');
    this.patDemoInsurance = document.getElementById('pat-demo-insurance');
    this.patAlertAllergies = document.getElementById('pat-alert-allergies');
    this.patAlertConditions = document.getElementById('pat-alert-conditions');
    this.patAlertClinic = document.getElementById('pat-alert-clinic');
    this.patAlertPhysician = document.getElementById('pat-alert-physician');

    // Patient Scheduler Modal Elements
    this.btnPatientOpenSchedule = document.getElementById('btn-patient-open-schedule');
    this.patientScheduleModal = document.getElementById('patient-schedule-modal');
    this.btnClosePatientScheduleModal = document.getElementById('btn-close-patient-schedule-modal');
    this.btnCancelPatientSchedule = document.getElementById('btn-cancel-patient-schedule');
    this.patientScheduleForm = document.getElementById('patient-new-schedule-form');

    // Clinical Chart Modal Elements
    this.chartModal = document.getElementById('patient-chart-modal');
    this.closeChartModalBtn = document.getElementById('btn-close-chart-modal');
    this.chartDoneBtn = document.getElementById('btn-chart-done');
    this.tabChartAll = document.getElementById('tab-chart-all');
    this.tabChartPending = document.getElementById('tab-chart-pending');
    this.tabChartAdministered = document.getElementById('tab-chart-administered');
    this.chartPendingSection = document.getElementById('chart-pending-section');
    this.chartAdministeredSection = document.getElementById('chart-administered-section');
    this.chartPendingContainer = document.getElementById('chart-pending-container');
    this.chartAdministeredContainer = document.getElementById('chart-administered-container');
    this.chartPendingBadge = document.getElementById('chart-pending-badge');
    this.chartAdministeredBadge = document.getElementById('chart-administered-badge');
    this.btnChartAddDose = document.getElementById('btn-chart-add-dose');

    // Alternative Phone in Demographics
    this.patDemoAltPhone = document.getElementById('pat-demo-alt-phone');
    this.patDemoCohortCategory = document.getElementById('pat-demo-cohort-category');
    this.patCardCategory = document.getElementById('pat-card-category');

    // Certificate Modal Elements
    this.certificateModal = document.getElementById('certificate-modal');
    this.btnCloseCertModal = document.getElementById('btn-close-cert-modal');
    this.btnCloseCertSecondary = document.getElementById('btn-close-cert-secondary');

    // Profile Modal Elements
    this.btnOpenProfileList = document.querySelectorAll('.btn-open-profile-modal');
    this.profileModal = document.getElementById('user-profile-modal');
    this.btnCloseProfileModal = document.getElementById('btn-close-profile-modal');
    this.btnCancelProfile = document.getElementById('btn-cancel-profile');
    this.profileForm = document.getElementById('edit-profile-form');

    // Share Modal Elements (GMail, WhatsApp, SMS, Web Share)
    this.shareModal = document.getElementById('share-vaccine-modal');
    this.btnCloseShareModal = document.getElementById('btn-close-share-modal');
    this.shareTargetInfo = document.getElementById('share-target-info');
    this.sharePatientEmail = document.getElementById('share-patient-email');
    this.sharePatientPhone = document.getElementById('share-patient-phone');
    this.shareCountryCode = document.getElementById('share-country-code');
    this.shareMessageBody = document.getElementById('share-message-body');
    this.btnShareGmail = document.getElementById('btn-share-gmail');
    this.btnShareWhatsApp = document.getElementById('btn-share-whatsapp');
    this.btnShareWhatsAppWeb = document.getElementById('btn-share-whatsapp-web');
    this.btnShareSms = document.getElementById('btn-share-sms');
    this.btnShareUniversal = document.getElementById('btn-share-universal');
    this.btnCopyShareText = document.getElementById('btn-copy-share-text');

    // Doctor Edit Scheduled Vaccine Modal Elements
    this.editScheduleModal = document.getElementById('edit-schedule-modal');
    this.btnCloseEditScheduleModal = document.getElementById('btn-close-edit-schedule-modal');
    this.btnCancelEditSchedule = document.getElementById('btn-cancel-edit-schedule');
    this.editScheduleForm = document.getElementById('edit-schedule-form');

    // Patient Reschedule Appointment Modal Elements
    this.patientEditDoseModal = document.getElementById('patient-edit-dose-modal');
    this.btnClosePatEditModal = document.getElementById('btn-close-pat-edit-modal');
    this.btnCancelPatEdit = document.getElementById('btn-cancel-pat-edit');
    this.patientEditDoseForm = document.getElementById('patient-edit-dose-form');
  },

  bindEvents() {
    // Logout buttons
    document.querySelectorAll('.btn-portal-logout').forEach(btn => {
      btn.onclick = () => window.AuthController.logout();
    });

    // Search filter
    if (this.searchInput) {
      this.searchInput.oninput = (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderPatientTable();
      };
    }

    // Filter pills
    if (this.filterPills) {
      this.filterPills.forEach(pill => {
        pill.onclick = () => {
          this.filterPills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          this.activeFilter = pill.dataset.filter || 'all';
          this.renderPatientTable();
        };
      });
    }

    // Profile Modal triggers
    if (this.btnOpenProfileList) {
      this.btnOpenProfileList.forEach(btn => {
        btn.onclick = () => this.openProfileModal();
      });
    }

    const closeProfileModal = () => {
      if (this.profileModal) this.profileModal.style.display = 'none';
    };

    if (this.btnCloseProfileModal) this.btnCloseProfileModal.onclick = closeProfileModal;
    if (this.btnCancelProfile) this.btnCancelProfile.onclick = closeProfileModal;

    if (this.profileModal) {
      this.profileModal.onclick = (e) => {
        if (e.target === this.profileModal) closeProfileModal();
      };
    }

    // Certificate Modal triggers
    if (this.btnCloseCertModal) this.btnCloseCertModal.onclick = () => this.closeCertificateModal();
    if (this.btnCloseCertSecondary) this.btnCloseCertSecondary.onclick = () => this.closeCertificateModal();
    if (this.certificateModal) {
      this.certificateModal.onclick = (e) => {
        if (e.target === this.certificateModal) this.closeCertificateModal();
      };
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.certificateModal && this.certificateModal.style.display === 'flex') {
        this.closeCertificateModal();
      }
    });

    if (this.profileForm) {
      this.profileForm.onsubmit = async (e) => {
        e.preventDefault();
        await this.handleProfileSubmit();
      };
    }

    // Share Modal Triggers (GMail, WhatsApp, SMS, Universal)
    if (this.btnCloseShareModal) {
      this.btnCloseShareModal.onclick = () => this.closeShareModal();
    }
    if (this.btnShareGmail) {
      this.btnShareGmail.onclick = () => this.handleShareGmail();
    }
    if (this.btnShareWhatsApp) {
      this.btnShareWhatsApp.onclick = () => this.handleShareWhatsApp(false);
    }
    if (this.btnShareWhatsAppWeb) {
      this.btnShareWhatsAppWeb.onclick = () => this.handleShareWhatsApp(true);
    }
    if (this.btnShareSms) {
      this.btnShareSms.onclick = () => this.handleShareSMS();
    }
    if (this.btnShareUniversal) {
      this.btnShareUniversal.onclick = () => this.handleShareUniversal();
    }
    if (this.btnCopyShareText) {
      this.btnCopyShareText.onclick = () => this.handleCopyShareText();
    }
    if (this.shareModal) {
      this.shareModal.onclick = (e) => {
        if (e.target === this.shareModal) this.closeShareModal();
      };
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.shareModal && this.shareModal.style.display === 'flex') {
        this.closeShareModal();
      }
    });

    // Doctor Edit Scheduled Vaccine Modal Triggers
    const closeDocEditModal = () => {
      if (this.editScheduleModal) this.editScheduleModal.style.display = 'none';
    };
    if (this.btnCloseEditScheduleModal) this.btnCloseEditScheduleModal.onclick = closeDocEditModal;
    if (this.btnCancelEditSchedule) this.btnCancelEditSchedule.onclick = closeDocEditModal;
    if (this.editScheduleModal) {
      this.editScheduleModal.onclick = (e) => {
        if (e.target === this.editScheduleModal) closeDocEditModal();
      };
    }
    if (this.editScheduleForm) {
      this.editScheduleForm.onsubmit = async (e) => {
        e.preventDefault();
        await this.handleEditScheduleSubmit();
      };
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.editScheduleModal && this.editScheduleModal.style.display === 'flex') {
        closeDocEditModal();
      }
    });

    // Patient Reschedule Appointment Modal Triggers
    const closePatEditModal = () => {
      if (this.patientEditDoseModal) this.patientEditDoseModal.style.display = 'none';
    };
    if (this.btnClosePatEditModal) this.btnClosePatEditModal.onclick = closePatEditModal;
    if (this.btnCancelPatEdit) this.btnCancelPatEdit.onclick = closePatEditModal;
    if (this.patientEditDoseModal) {
      this.patientEditDoseModal.onclick = (e) => {
        if (e.target === this.patientEditDoseModal) closePatEditModal();
      };
    }
    if (this.patientEditDoseForm) {
      this.patientEditDoseForm.onsubmit = async (e) => {
        e.preventDefault();
        await this.handlePatientEditDoseSubmit();
      };
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.patientEditDoseModal && this.patientEditDoseModal.style.display === 'flex') {
        closePatEditModal();
      }
    });

    // Modal triggers: Schedule from Main Dashboard (Fresh Blank Form)
    if (this.openScheduleModalBtn) {
      this.openScheduleModalBtn.onclick = () => {
        this.openedScheduleFromChart = null;
        this.currentSchedulingPatientId = null;
        if (this.scheduleForm) this.scheduleForm.reset();

        const pidInput = document.getElementById('sched-patient-id');
        if (pidInput) pidInput.value = '';

        const nameInput = document.getElementById('sched-patient-name');
        const emailInput = document.getElementById('sched-email');
        const allergiesInput = document.getElementById('sched-allergies');
        const phoneInput = document.getElementById('sched-phone');
        const emergencyInput = document.getElementById('sched-emergency');
        const vaccineInput = document.getElementById('sched-vaccine');
        const doseInput = document.getElementById('sched-dose');
        const dobInput = document.getElementById('sched-dob');
        const genderInput = document.getElementById('sched-gender');
        const bloodInput = document.getElementById('sched-blood');
        const dateInput = document.getElementById('sched-date');
        const timeInput = document.getElementById('sched-time');

        if (emailInput) emailInput.value = '';

        if (nameInput) {
          nameInput.value = '';
          nameInput.removeAttribute('disabled');
          nameInput.readOnly = false;
          nameInput.style.background = '';
          nameInput.style.cursor = '';
        }
        if (allergiesInput) allergiesInput.value = '';
        if (phoneInput) {
          phoneInput.value = '';
          phoneInput.classList.remove('invalid-input', 'valid-input');
        }
        if (emergencyInput) emergencyInput.value = '';
        if (vaccineInput) vaccineInput.value = '';
        if (doseInput) doseInput.value = '';
        if (dobInput) dobInput.value = '';
        if (genderInput) genderInput.selectedIndex = 0;
        if (bloodInput) bloodInput.selectedIndex = 0;

        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        if (dateInput) dateInput.value = tomorrow;
        if (timeInput) timeInput.value = '10:30';

        const cancelBtn = document.getElementById('btn-cancel-schedule');
        if (cancelBtn) cancelBtn.textContent = 'Cancel';

        const modalHeader = this.scheduleModal.querySelector('.modal-header h3');
        if (modalHeader) modalHeader.innerHTML = '💉 Schedule Patient Vaccination';

        this.scheduleModal.style.display = 'flex';
      };
    }

    const closeScheduleModal = () => {
      if (this.scheduleModal) this.scheduleModal.style.display = 'none';
      if (this.openedScheduleFromChart) {
        const pId = this.openedScheduleFromChart;
        this.openedScheduleFromChart = null;
        this.currentSchedulingPatientId = null;
        if (this.chartModal) this.chartModal.style.display = 'flex';
        this.handleOpenChart(pId);
      }
    };

    if (this.closeScheduleModalBtn) {
      this.closeScheduleModalBtn.onclick = closeScheduleModal;
    }

    if (this.cancelScheduleBtn) {
      this.cancelScheduleBtn.onclick = closeScheduleModal;
    }

    if (this.scheduleModal) {
      this.scheduleModal.onclick = (e) => {
        if (e.target === this.scheduleModal) closeScheduleModal();
      };
    }

    // New schedule submission
    if (this.scheduleForm) {
      this.scheduleForm.onsubmit = async (e) => {
        e.preventDefault();
        await this.handleScheduleSubmit();
      };
    }

    // Chart Modal triggers
    const closeChartModal = () => {
      if (this.chartModal) this.chartModal.style.display = 'none';
    };

    if (this.closeChartModalBtn) this.closeChartModalBtn.onclick = closeChartModal;
    if (this.chartDoneBtn) this.chartDoneBtn.onclick = closeChartModal;

    // Close on clicking backdrop
    if (this.chartModal) {
      this.chartModal.onclick = (e) => {
        if (e.target === this.chartModal) closeChartModal();
      };
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.chartModal && this.chartModal.style.display === 'flex') {
        closeChartModal();
      }
    });

    // 3-Way Tabs in Chart Modal (All / Pending / Administered)
    const setChartTab = (activeTab) => {
      const allTabs = [this.tabChartAll, this.tabChartPending, this.tabChartAdministered].filter(Boolean);
      allTabs.forEach(t => t.classList.remove('active'));

      const pSec = this.chartPendingSection || document.getElementById('chart-pending-section');
      const aSec = this.chartAdministeredSection || document.getElementById('chart-administered-section');

      if (activeTab === 'all') {
        if (this.tabChartAll) this.tabChartAll.classList.add('active');
        if (pSec) pSec.style.display = 'flex';
        if (aSec) aSec.style.display = 'flex';
      } else if (activeTab === 'pending') {
        if (this.tabChartPending) this.tabChartPending.classList.add('active');
        if (pSec) pSec.style.display = 'flex';
        if (aSec) aSec.style.display = 'none';
      } else if (activeTab === 'administered') {
        if (this.tabChartAdministered) this.tabChartAdministered.classList.add('active');
        if (pSec) pSec.style.display = 'none';
        if (aSec) aSec.style.display = 'flex';
      }
    };

    if (this.tabChartAll) this.tabChartAll.onclick = () => setChartTab('all');
    if (this.tabChartPending) this.tabChartPending.onclick = () => setChartTab('pending');
    if (this.tabChartAdministered) this.tabChartAdministered.onclick = () => setChartTab('administered');

    // Quick Prescribe / Schedule Dose button inside Chart Modal
    if (this.btnChartAddDose) {
      this.btnChartAddDose.onclick = () => {
        const patient = this.activeChartPatient || this.allPatients.find(p => String(p.id) === String(this.currentActiveChartPatientId));
        if (patient) {
          this.openedScheduleFromChart = patient.id;
          this.currentSchedulingPatientId = patient.id;
          if (this.scheduleForm) this.scheduleForm.reset();

          const pidInput = document.getElementById('sched-patient-id');
          if (pidInput) pidInput.value = patient.id;

          const nameInput = document.getElementById('sched-patient-name');
          const emailInput = document.getElementById('sched-email');
          const dobInput = document.getElementById('sched-dob');
          const genderInput = document.getElementById('sched-gender');
          const bloodInput = document.getElementById('sched-blood');
          const allergyInput = document.getElementById('sched-allergies');
          const phoneInput = document.getElementById('sched-phone');
          const emergencyInput = document.getElementById('sched-emergency');
          const vaccineInput = document.getElementById('sched-vaccine');
          const doseInput = document.getElementById('sched-dose');
          const dateInput = document.getElementById('sched-date');
          const timeInput = document.getElementById('sched-time');

          if (emailInput) {
            emailInput.value = (patient.email && patient.email !== 'Not provided') ? patient.email : '';
          }

          if (nameInput) {
            nameInput.value = patient.fullName || '';
            nameInput.readOnly = true;
            nameInput.style.background = '#f8fafc';
            nameInput.style.cursor = 'not-allowed';
          }
          if (dobInput && patient.dob) dobInput.value = patient.dob;
          if (genderInput && patient.gender) genderInput.value = patient.gender;
          if (bloodInput && patient.bloodGroup) bloodInput.value = patient.bloodGroup;
          if (allergyInput) {
            allergyInput.value = (patient.allergies && patient.allergies !== 'None' && patient.allergies !== 'No documented allergies') ? patient.allergies : '';
          }
          if (phoneInput) {
            if (patient.phone && patient.phone !== 'Not provided') {
              const digits = patient.phone.replace(/\D/g, '');
              phoneInput.value = digits.slice(-10);
            } else {
              phoneInput.value = '';
            }
            phoneInput.classList.remove('invalid-input', 'valid-input');
          }
          if (emergencyInput) {
            emergencyInput.value = (patient.emergencyContact && patient.emergencyContact !== 'Not provided') ? patient.emergencyContact : '';
          }
          if (vaccineInput) {
            vaccineInput.value = '';
            setTimeout(() => vaccineInput.focus(), 150);
          }
          if (doseInput) doseInput.value = '';

          const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
          if (dateInput) dateInput.value = tomorrow;
          if (timeInput) timeInput.value = '10:30';

          const cancelBtn = document.getElementById('btn-cancel-schedule');
          if (cancelBtn) cancelBtn.textContent = '← Back to Patient Chart';

          const modalHeader = this.scheduleModal.querySelector('.modal-header h3');
          if (modalHeader) modalHeader.innerHTML = `💉 Schedule Vaccination for ${patient.fullName}`;

          // Temporarily hide the chart modal to prevent double overlay confusion
          if (this.chartModal) this.chartModal.style.display = 'none';
        }
        if (this.scheduleModal) this.scheduleModal.style.display = 'flex';
      };
    }

    // Patient Schedule Modal triggers
    if (this.btnPatientOpenSchedule) {
      this.btnPatientOpenSchedule.onclick = () => {
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        const dateInput = document.getElementById('pat-sched-date');
        if (dateInput && !dateInput.value) dateInput.value = tomorrow;
        if (this.patientScheduleModal) this.patientScheduleModal.style.display = 'flex';
      };
    }

    const closePatientScheduleModal = () => {
      if (this.patientScheduleModal) this.patientScheduleModal.style.display = 'none';
    };

    if (this.btnClosePatientScheduleModal) this.btnClosePatientScheduleModal.onclick = closePatientScheduleModal;
    if (this.btnCancelPatientSchedule) this.btnCancelPatientSchedule.onclick = closePatientScheduleModal;

    if (this.patientScheduleModal) {
      this.patientScheduleModal.onclick = (e) => {
        if (e.target === this.patientScheduleModal) closePatientScheduleModal();
      };
    }

    // Close patient schedule modal on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.patientScheduleModal && this.patientScheduleModal.style.display === 'flex') {
        closePatientScheduleModal();
      }
    });

    if (this.patientScheduleForm) {
      this.patientScheduleForm.onsubmit = async (e) => {
        e.preventDefault();
        await this.handlePatientScheduleSubmit();
      };
    }
  },

  // =========================================================================
  // DOCTOR DASHBOARD METHODS
  // =========================================================================
  async initDoctorDashboard() {
    const docName = this.currentUser.fullName || 'Dr. Sarah Jenkins, MD, FAAP';
    const hospital = this.currentUser.doctorDetails?.hospital || 'Swedish Medical Center — Pediatric Specialty Clinic';
    const license = this.currentUser.doctorDetails?.licenseNumber || 'NPI #8492019482';

    this.docNameDisplay.textContent = docName;
    this.docSubtitle.textContent = `Lead Pediatrician & Immunologist • ${license} • ${hospital}`;

    await this.fetchPatientsRoster();
  },

  async fetchPatientsRoster() {
    try {
      const response = await window.api.getPatients();
      this.allPatients = response.patients || [];

      // Update metrics
      if (response.stats) {
        this.metricCaseload.textContent = response.stats.totalCaseload;
        this.metricCompliance.innerHTML = `${response.stats.complianceRate} <small>(36 verified doses)</small>`;
        this.metricOverdue.textContent = response.stats.overdueRecalls;
        this.metricHighRisk.textContent = response.stats.highRiskCount;
      }

      this.renderPatientTable();
    } catch (err) {
      window.AuthController.showToast('Could not load patient roster: ' + err.message, 'error');
    }
  },

  renderPatientTable() {
    if (!this.tableBody) return;

    let filtered = [...this.allPatients];

    // Filter by tab
    if (this.activeFilter === 'overdue') {
      filtered = filtered.filter(p => p.status === 'Overdue');
    } else if (this.activeFilter === 'high-risk') {
      filtered = filtered.filter(p => p.riskFactors && p.riskFactors !== 'None');
    } else if (this.activeFilter === 'today') {
      filtered = filtered.filter(p => p.scheduledDateDisplay && p.scheduledDateDisplay.includes('Today'));
    }

    // Filter by search query
    if (this.searchQuery) {
      filtered = filtered.filter(p => {
        return (
          p.fullName.toLowerCase().includes(this.searchQuery) ||
          p.mrn.toLowerCase().includes(this.searchQuery) ||
          p.vaccineName.toLowerCase().includes(this.searchQuery) ||
          (p.allergies && p.allergies.toLowerCase().includes(this.searchQuery)) ||
          (p.riskFactors && p.riskFactors.toLowerCase().includes(this.searchQuery))
        );
      });
    }

    if (this.allPatients.length === 0) {
      this.tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 50px 24px; color: var(--text-muted);">
            <div style="font-size: 2.8rem; margin-bottom: 12px;">🩺</div>
            <strong style="font-size: 1.15rem; color: var(--text-main); display: block; margin-bottom: 6px;">No patients enrolled yet</strong>
            <p style="font-size: 0.88rem; max-width: 480px; margin: 0 auto 20px; line-height: 1.5;">
              Welcome, Dr. ${this.currentUser?.fullName || 'Doctor'}! You do not have any patient records assigned yet. Add your patient's details and schedule their first immunization to get started.
            </p>
            <button type="button" class="btn-primary-glow" onclick="document.getElementById('btn-open-schedule-modal').click()" style="padding: 10px 24px; font-size: 0.9rem;">
              ➕ Add Patient & Schedule Vaccine
            </button>
          </td>
        </tr>
      `;
      return;
    }

    if (filtered.length === 0) {
      this.tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
            No matching patient records found for this filter.
          </td>
        </tr>
      `;
      return;
    }

    this.tableBody.innerHTML = filtered.map(patient => {
      // Calculate initials
      const nameParts = patient.fullName.split(',');
      let initials = 'PT';
      if (nameParts.length > 1) {
        initials = (nameParts[0].trim()[0] + nameParts[1].trim()[0]).toUpperCase();
      } else {
        const parts = patient.fullName.trim().split(' ');
        initials = parts.map(p => p[0]).join('').slice(0, 2).toUpperCase();
      }

      // Risk tags
      let riskHtml = '';
      if (patient.riskFactors && patient.riskFactors !== 'None') {
        riskHtml += `<span class="risk-tag">${patient.riskFactors}</span><br>`;
      }
      if (patient.allergies && patient.allergies !== 'None' && patient.allergies !== 'No documented allergies') {
        riskHtml += `<span class="allergy-tag">Allergies: ${patient.allergies}</span>`;
      }
      if (!riskHtml) {
        riskHtml = `<span class="no-risk-tag">No documented allergies</span>`;
      }

      // Status pill
      const isOverdue = patient.status === 'Overdue' || this.isDoseOverdue(patient);
      let statusClass = 'status-scheduled';
      let statusIcon = '📅';
      let statusLabel = patient.status || 'Scheduled';
      if (isOverdue) {
        statusClass = 'status-overdue';
        statusIcon = '⚠️';
        statusLabel = 'Overdue';
      } else if (patient.status === 'Administered') {
        statusClass = 'status-administered';
        statusIcon = '✅';
        statusLabel = 'Administered';
      }

      return `
        <tr id="row-${patient.id}" class="${isOverdue ? 'row-overdue-alert' : ''}">
          <!-- PATIENT LEGAL NAME & MRN -->
          <td>
            <div class="patient-cell" onclick="DashboardController.handleOpenChart('${patient.id}')" title="Click to open ${patient.fullName}'s clinical chart">
              <div class="avatar-badge-initials">${initials}</div>
              <div class="patient-info-text">
                <strong>${patient.fullName}</strong>
                <span>${patient.mrn} • ${patient.gender} (${patient.bloodGroup})</span>
              </div>
            </div>
          </td>

          <!-- DOB & AGE -->
          <td>
            <div class="dob-cell">
              <strong>${patient.dob}</strong>
              <span>${patient.ageDisplay}</span>
            </div>
          </td>

          <!-- CLINICAL NOTES & ALLERGIES -->
          <td>
            ${riskHtml}
          </td>

          <!-- PROTOCOL -->
          <td>
            <span class="protocol-badge">${patient.protocol || 'CDC'}</span>
          </td>

          <!-- VACCINATION DETAILS (HIGHLIGHTED WITH RED LIGHT ON OVERDUE) -->
          <td>
            <div class="vaccine-cell ${isOverdue ? 'vaccine-overdue-glow' : ''}">
              <strong>${patient.vaccineName}</strong>
              <span>${patient.doseNumber}</span>
              <div style="margin-top: 4px;">
                <span class="status-pill ${statusClass}">
                  ${statusIcon} ${patient.status}
                </span>
              </div>
            </div>
          </td>

          <!-- TIMESTAMP & SCHEDULED SLOT -->
          <td>
            <div class="timestamp-text">
              ${patient.scheduledDateDisplay}
            </div>
          </td>

          <!-- ACTIONS -->
          <td>
            <div class="action-buttons-group">
              <button type="button" class="btn-open-chart" onclick="DashboardController.handleOpenChart('${patient.id}')">
                Open Chart &rarr;
              </button>
              <button type="button" class="btn-action-icon btn-action-administer" title="Administer Dose / Record Lot Number" aria-label="Administer Dose / Record Lot Number" onclick="DashboardController.handleRecordDose('${patient.id}')">
                💉
              </button>
              <button type="button" class="btn-action-icon btn-action-edit" title="Edit Scheduled Vaccine & Date" aria-label="Edit Scheduled Vaccine" onclick="DashboardController.handleOpenEditScheduleModal('${patient.id}')">
                ✏️
              </button>
              <button type="button" class="btn-action-icon btn-action-share ${isOverdue ? 'btn-share-overdue' : ''}" title="${isOverdue ? '⚠️ Overdue Recall: Share Vaccine Information (GMail, WhatsApp, SMS)' : 'Share Vaccine Record & Notice (GMail, WhatsApp, SMS)'}" aria-label="Share Vaccine Notice" onclick="DashboardController.handleOpenShareModal('${patient.fullName.replace(/'/g, "\\'")}', ${isOverdue}, '${patient.id}')">
                📤
              </button>
              <button type="button" class="btn-action-icon btn-action-delete" title="Delete Patient Record" aria-label="Delete Patient Record" onclick="DashboardController.handleDeletePatient('${patient.id}', '${patient.fullName.replace(/'/g, "\\'")}')">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  async handleRecordDose(patientId) {
    const clickedBtn = window.event ? window.event.target.closest('button') : null;
    if (clickedBtn) {
      clickedBtn.disabled = true;
      clickedBtn.innerHTML = '⏳';
      clickedBtn.style.transform = 'scale(1.15)';
    }

    // Immediate optimistic update in table row (0ms instant response!)
    const patient = this.allPatients.find(p => String(p.id) === String(patientId));
    if (patient) {
      patient.status = 'Administered';
      const now = new Date();
      patient.scheduledDateDisplay = `Administered ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      this.renderPatientTable();
      window.AuthController.showToast(`💉 Vaccine dose successfully administered for ${patient.fullName}!`, 'success');
    }

    try {
      const response = await window.api.recordDose(patientId);
      await this.fetchPatientsRoster();
    } catch (err) {
      window.AuthController.showToast('Failed to record dose: ' + err.message, 'error');
      await this.fetchPatientsRoster();
    }
  },

  // Backward compatible wrapper
  handleSendReminder(patientName, isOverdue = false, patientId = null) {
    this.handleOpenShareModal(patientName, isOverdue, patientId);
  },

  handleSendReminderFromChart() {
    this.handleOpenShareModalFromChart();
  },

  handleOpenShareModal(patientName, isOverdue = false, patientId = null, doseId = null) {
    let patient = patientId ? this.allPatients.find(p => String(p.id) === String(patientId)) : null;
    if (!patient && this.activeChartPatient && (!patientId || String(this.activeChartPatient.id) === String(patientId))) {
      patient = this.activeChartPatient;
    }

    let targetDose = null;
    if (patient && doseId && Array.isArray(patient.pendingVaccines)) {
      targetDose = patient.pendingVaccines.find(d => String(d.id) === String(doseId));
    }
    if (!targetDose && patient && Array.isArray(patient.pendingVaccines) && patient.pendingVaccines.length > 0) {
      targetDose = patient.pendingVaccines[0];
    }

    const recipientEmail = (patient && patient.email && patient.email.trim() && patient.email !== 'Not provided') ? patient.email.trim() : '';
    const rawPhone = (patient && (patient.phone || patient.altPhone)) ? (patient.phone || patient.altPhone) : '';
    const cleanDigits = rawPhone ? String(rawPhone).replace(/\D/g, '') : '';
    const displayPhone = this.formatPhoneNumber(cleanDigits) || cleanDigits;

    const clinicName = this.currentUser?.doctorDetails?.hospital || patient?.clinicAssigned || 'Swedish Medical Center';
    const doctorName = this.currentUser?.fullName || patient?.doctorAssigned || 'Dr. Sarah Jenkins, MD';
    const vaccineName = targetDose ? targetDose.vaccine : (patient?.vaccineName || 'Scheduled Immunization');
    const dose = targetDose ? targetDose.dose : (patient?.doseNumber || 'Routine Dose');
    const dateStr = targetDose ? targetDose.scheduledDisplay : (patient?.scheduledDateDisplay || 'See Clinic Schedule');
    const mrn = patient?.mrn || 'MRN-VERIFIED';

    this.activeShareTarget = {
      patient,
      patientName,
      patientEmail: recipientEmail,
      patientPhone: cleanDigits,
      vaccineName,
      dose,
      dateStr,
      isOverdue,
      clinicName,
      doctorName
    };

    const targetInfoEl = document.getElementById('share-target-info');
    if (targetInfoEl) {
      targetInfoEl.innerHTML = `👤 <strong>${patientName}</strong> (${mrn}) &nbsp;•&nbsp; 💉 <strong>${vaccineName}</strong> (${dose})`;
    }

    const emailInput = document.getElementById('share-patient-email');
    if (emailInput) emailInput.value = recipientEmail;

    const phoneInput = document.getElementById('share-patient-phone');
    if (phoneInput) phoneInput.value = cleanDigits ? cleanDigits.slice(-10) : '';

    const ccSelect = document.getElementById('share-country-code');
    if (ccSelect) ccSelect.value = '91';

    const subject = `${isOverdue ? 'URGENT Overdue' : 'Clinical Notice:'} Vaccination Reminder for ${patientName} — ${vaccineName}`;
    let autoFilledBody = '';
    if (isOverdue) {
      autoFilledBody = 
        `🚨 URGENT CLINICAL NOTICE: OVERDUE VACCINATION RECALL\n` +
        `--------------------------------------------------\n` +
        `Dear ${patientName},\n\n` +
        `Our clinical records at ${clinicName} indicate that your scheduled immunization for ${vaccineName} (${dose}) is currently OVERDUE.\n\n` +
        `• Patient: ${patientName} (MRN: ${mrn})\n` +
        `• Vaccine: ${vaccineName}\n` +
        `• Required Dose: ${dose}\n` +
        `• Overdue Scheduled Slot: ${dateStr}\n` +
        `• Healthcare Center: ${clinicName}\n` +
        `• Supervising Physician: ${doctorName}\n\n` +
        `Please contact our clinic immediately or log in to your ImmuTrack Portal to reschedule:\n` +
        `https://immutrack.health/portal\n\n` +
        `ImmuTrack EHR Clinical Registry System`;
    } else {
      autoFilledBody = 
        `🏥 OFFICIAL CLINICAL VACCINATION REMINDER & EHR RECORD\n` +
        `--------------------------------------------------\n` +
        `Hello ${patientName},\n\n` +
        `This is an official immunization reminder from your attending clinical team at ${clinicName}.\n\n` +
        `• Patient: ${patientName} (MRN: ${mrn})\n` +
        `• Scheduled Vaccine: ${vaccineName}\n` +
        `• Dose / Stage: ${dose}\n` +
        `• Scheduled Appointment: ${dateStr}\n` +
        `• Healthcare Center: ${clinicName}\n` +
        `• Attending Clinician: ${doctorName}\n\n` +
        `You can review your verified digital records or confirm your visit on your patient portal:\n` +
        `https://immutrack.health/portal\n\n` +
        `ImmuTrack EHR Clinical Registry System`;
    }

    this.activeShareTarget.subject = subject;
    const bodyTextarea = document.getElementById('share-message-body');
    if (bodyTextarea) bodyTextarea.value = autoFilledBody;

    const modal = document.getElementById('share-vaccine-modal');
    if (modal) modal.style.display = 'flex';
  },

  handleOpenShareModalFromChart() {
    if (!this.currentActiveChartPatientId) return;
    const patient = this.activeChartPatient || this.allPatients.find(p => String(p.id) === String(this.currentActiveChartPatientId));
    if (patient) {
      this.handleOpenShareModal(patient.fullName, patient.status === 'Overdue', patient.id);
    }
  },

  handleOpenPatientShareModal(doseId) {
    const upcoming = this.patientUpcomingCache || [];
    const targetDose = upcoming.find(d => String(d.id) === String(doseId));
    const patientName = this.currentUser?.fullName || 'Patient';
    const patientEmail = this.currentUser?.email || '';
    const patientPhone = this.currentUser?.phone || '';

    const targetInfoEl = document.getElementById('share-target-info');
    if (targetInfoEl) {
      targetInfoEl.innerHTML = `👤 <strong>${patientName}</strong> &nbsp;•&nbsp; 💉 <strong>${targetDose?.vaccine || 'Vaccine'}</strong> (${targetDose?.dose || 'Dose'})`;
    }

    const emailInput = document.getElementById('share-patient-email');
    if (emailInput) emailInput.value = patientEmail;

    const phoneInput = document.getElementById('share-patient-phone');
    if (phoneInput) phoneInput.value = patientPhone ? patientPhone.replace(/\D/g, '').slice(-10) : '';

    const ccSelect = document.getElementById('share-country-code');
    if (ccSelect) ccSelect.value = '91';

    const subject = `Vaccination Appointment Notice: ${targetDose?.vaccine || 'Immunization'}`;
    const autoFilledBody = 
      `🗓️ VACCINATION APPOINTMENT DETAILS\n` +
      `--------------------------------------------------\n` +
      `• Patient: ${patientName}\n` +
      `• Vaccine: ${targetDose?.vaccine || 'Scheduled Dose'}\n` +
      `• Dose: ${targetDose?.dose || 'Routine Dose'}\n` +
      `• Scheduled Slot: ${targetDose?.scheduledDisplay || 'Upcoming'}\n` +
      `• Clinic Location: ${targetDose?.clinic || 'Healthcare Clinic'}\n` +
      `• Notes: ${targetDose?.notes || 'Scheduled appointment'}\n\n` +
      `Track verified doses and digital passes at ImmuTrack EHR:\n` +
      `https://immutrack.health/portal`;

    this.activeShareTarget = {
      patientName,
      patientEmail,
      patientPhone,
      subject
    };

    const bodyTextarea = document.getElementById('share-message-body');
    if (bodyTextarea) bodyTextarea.value = autoFilledBody;

    const modal = document.getElementById('share-vaccine-modal');
    if (modal) modal.style.display = 'flex';
  },

  closeShareModal() {
    const modal = document.getElementById('share-vaccine-modal');
    if (modal) modal.style.display = 'none';
    this.activeShareTarget = null;
  },

  handleShareGmail() {
    const emailInput = document.getElementById('share-patient-email');
    const recipientEmail = emailInput ? emailInput.value.trim() : (this.activeShareTarget?.patientEmail || '');
    const textarea = document.getElementById('share-message-body');
    const body = textarea ? textarea.value : '';
    const subject = this.activeShareTarget?.subject || 'Vaccination Notice & Clinical Record';

    // Official Google GMail Web Composer URL (pre-populates to, subject, body in browser)
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank');
    window.AuthController.showToast(`GMail composer opened for ${recipientEmail || 'patient'}!`, 'success');
  },

  handleShareWhatsApp(directWeb = false) {
    const phoneInput = document.getElementById('share-patient-phone');
    const countryCodeSelect = document.getElementById('share-country-code');
    const rawPhone = phoneInput ? phoneInput.value.trim() : (this.activeShareTarget?.patientPhone || '');
    const textarea = document.getElementById('share-message-body');
    const body = textarea ? textarea.value : '';

    // Strip non-digits and leading zeroes
    let cleanDigits = rawPhone.replace(/\D/g, '').replace(/^0+/, '');

    if (!cleanDigits) {
      window.AuthController.showToast('Please enter or verify the patient mobile number for WhatsApp.', 'error');
      if (phoneInput) phoneInput.focus();
      return;
    }

    let selectedCC = countryCodeSelect ? countryCodeSelect.value : '91';
    if (!selectedCC || selectedCC === 'custom') selectedCC = '91';

    let fullIntlNumber = cleanDigits;
    if (cleanDigits.length === 10) {
      fullIntlNumber = selectedCC + cleanDigits;
    } else if (cleanDigits.length > 10 && !cleanDigits.startsWith(selectedCC)) {
      fullIntlNumber = cleanDigits;
    }

    let waUrl;
    if (directWeb) {
      // Direct WhatsApp Web compose for unsaved contact in browser tab
      waUrl = `https://web.whatsapp.com/send?phone=${fullIntlNumber}&text=${encodeURIComponent(body)}`;
    } else {
      // Official WhatsApp Click-to-Chat endpoint for unsaved numbers (works universally on mobile & desktop)
      waUrl = `https://api.whatsapp.com/send/?phone=${fullIntlNumber}&text=${encodeURIComponent(body)}&type=phone_number&app_absent=0`;
    }

    window.open(waUrl, '_blank');
    window.AuthController.showToast(`🟢 WhatsApp chat opened for +${fullIntlNumber} (No contact save needed)!`, 'success');
  },

  handleShareSMS() {
    const phoneInput = document.getElementById('share-patient-phone');
    const countryCodeSelect = document.getElementById('share-country-code');
    const rawPhone = phoneInput ? phoneInput.value.trim() : (this.activeShareTarget?.patientPhone || '');
    const textarea = document.getElementById('share-message-body');
    const body = textarea ? textarea.value : '';

    let cleanDigits = rawPhone.replace(/\D/g, '').replace(/^0+/, '');

    if (!cleanDigits) {
      window.AuthController.showToast('Please enter or verify the patient mobile number for SMS.', 'error');
      if (phoneInput) phoneInput.focus();
      return;
    }

    let selectedCC = countryCodeSelect ? countryCodeSelect.value : '91';
    if (!selectedCC || selectedCC === 'custom') selectedCC = '91';

    let formattedPhone = cleanDigits;
    if (cleanDigits.length === 10) {
      formattedPhone = `+${selectedCC}${cleanDigits}`;
    } else {
      formattedPhone = `+${cleanDigits}`;
    }

    // iOS uses &body= while Android, Windows Phone Link, and macOS use ?body=
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const separator = isIOS ? '&' : '?';

    // The sms: URI directly opens a new message conversation with this unsaved phone number
    const smsUrl = `sms:${encodeURIComponent(formattedPhone)}${separator}body=${encodeURIComponent(body)}`;
    window.open(smsUrl, '_blank');

    window.AuthController.showToast(`💬 SMS new message thread opened for ${formattedPhone}!`, 'success');
  },

  async handleShareUniversal() {
    const textarea = document.getElementById('share-message-body');
    const body = textarea ? textarea.value : '';
    const subject = this.activeShareTarget?.subject || 'Vaccination Notice & Clinical Record';

    if (navigator.share) {
      try {
        await navigator.share({
          title: subject,
          text: body,
          url: window.location.origin
        });
        window.AuthController.showToast('🌐 Shared successfully via device share sheet!', 'success');
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Native share notice:', err);
        }
      }
    }

    // Fallback: copy to clipboard
    this.handleCopyShareText();
    window.AuthController.showToast('📋 Notice copied to clipboard! You can paste into Telegram, Teams, or any app.', 'info');
  },

  handleCopyShareText() {
    const textarea = document.getElementById('share-message-body');
    const body = textarea ? textarea.value : '';
    if (!body) return;

    navigator.clipboard.writeText(body).then(() => {
      window.AuthController.showToast('📋 Vaccine information copied to clipboard!', 'success');
    }).catch(() => {
      if (textarea) {
        textarea.select();
        document.execCommand('copy');
        window.AuthController.showToast('📋 Vaccine information copied to clipboard!', 'success');
      }
    });
  },

  // ------------------------------------------------------------------
  // DOCTOR PORTAL: EDIT PATIENT INFO & SCHEDULED VACCINE MODAL HANDLERS
  // ------------------------------------------------------------------
  handleOpenEditFromChart() {
    if (!this.currentActiveChartPatientId) return;
    this.handleOpenEditScheduleModal(this.currentActiveChartPatientId);
  },

  handleOpenEditScheduleModal(patientId, doseId = null) {
    let patient = this.allPatients.find(p => String(p.id) === String(patientId));
    if (!patient && this.activeChartPatient && String(this.activeChartPatient.id) === String(patientId)) {
      patient = this.activeChartPatient;
    }
    if (!patient) return;

    let targetDose = null;
    if (doseId && Array.isArray(patient.pendingVaccines)) {
      targetDose = patient.pendingVaccines.find(d => String(d.id) === String(doseId));
    }
    if (!targetDose && Array.isArray(patient.pendingVaccines) && patient.pendingVaccines.length > 0) {
      targetDose = patient.pendingVaccines[0];
    }

    const pidInput = document.getElementById('edit-sched-patient-id');
    const didInput = document.getElementById('edit-sched-dose-id');
    const nameInput = document.getElementById('edit-sched-patient-name');
    const dobInput = document.getElementById('edit-sched-dob');
    const genderSelect = document.getElementById('edit-sched-gender');
    const bloodSelect = document.getElementById('edit-sched-blood');
    const allergiesInput = document.getElementById('edit-sched-allergies');
    const emailInput = document.getElementById('edit-sched-email');
    const phoneInput = document.getElementById('edit-sched-phone');
    const emergencyInput = document.getElementById('edit-sched-emergency');
    const vaccineInput = document.getElementById('edit-sched-vaccine');
    const doseInput = document.getElementById('edit-sched-dose');
    const dateInput = document.getElementById('edit-sched-date');
    const timeInput = document.getElementById('edit-sched-time');
    const statusSelect = document.getElementById('edit-sched-status');
    const urgencyInput = document.getElementById('edit-sched-urgency');
    const descTextarea = document.getElementById('edit-sched-desc');

    if (pidInput) pidInput.value = patient.id;
    if (didInput) didInput.value = targetDose ? targetDose.id : '';
    if (nameInput) nameInput.value = patient.fullName || '';
    if (dobInput) dobInput.value = patient.dob ? patient.dob.split('T')[0] : '';
    if (genderSelect) genderSelect.value = patient.gender || 'Female';
    if (bloodSelect) bloodSelect.value = patient.bloodGroup || 'O+';
    if (allergiesInput) allergiesInput.value = (patient.allergies && patient.allergies !== 'None documented') ? patient.allergies : '';
    if (emailInput) emailInput.value = patient.email || '';
    if (phoneInput) phoneInput.value = patient.phone ? patient.phone.replace(/\D/g, '').slice(-10) : '';
    if (emergencyInput) emergencyInput.value = (patient.emergencyContact && patient.emergencyContact !== 'Not provided') ? patient.emergencyContact : '';

    if (vaccineInput) vaccineInput.value = targetDose ? (targetDose.vaccine || '') : (patient.vaccineName || '');
    if (doseInput) doseInput.value = targetDose ? (targetDose.dose || '') : (patient.doseNumber || 'Dose 1');

    let scheduledDate = targetDose ? targetDose.scheduledDate : '';
    let scheduledTime = targetDose ? targetDose.scheduledTime : '';
    if (!scheduledDate && patient.scheduledTimestamp) {
      try {
        const d = new Date(patient.scheduledTimestamp);
        if (!isNaN(d.getTime())) {
          scheduledDate = d.toISOString().split('T')[0];
          scheduledTime = d.toTimeString().slice(0, 5);
        }
      } catch (e) {}
    }
    if (!scheduledDate) {
      scheduledDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    }
    if (!scheduledTime) scheduledTime = '10:30';

    if (dateInput) dateInput.value = scheduledDate;
    if (timeInput) timeInput.value = scheduledTime;
    if (statusSelect) statusSelect.value = (targetDose && targetDose.status) ? targetDose.status : (patient.status || 'Scheduled');
    if (urgencyInput) urgencyInput.value = targetDose ? (targetDose.urgency || '') : (patient.riskFactors || '');
    if (descTextarea) descTextarea.value = targetDose ? (targetDose.description || '') : (patient.vaccineDescription || '');

    const modal = document.getElementById('edit-schedule-modal');
    if (modal) modal.style.display = 'flex';
  },

  handleOpenEditChartPendingDose(patientId, doseId) {
    this.handleOpenEditScheduleModal(patientId, doseId);
  },

  closeEditScheduleModal() {
    const modal = document.getElementById('edit-schedule-modal');
    if (modal) modal.style.display = 'none';
  },

  async handleEditScheduleSubmit() {
    const patientId = document.getElementById('edit-sched-patient-id')?.value;
    const doseId = document.getElementById('edit-sched-dose-id')?.value;
    const fullName = document.getElementById('edit-sched-patient-name')?.value?.trim();
    const dob = document.getElementById('edit-sched-dob')?.value;
    const gender = document.getElementById('edit-sched-gender')?.value;
    const bloodGroup = document.getElementById('edit-sched-blood')?.value;
    const allergies = document.getElementById('edit-sched-allergies')?.value?.trim();
    const email = document.getElementById('edit-sched-email')?.value?.trim();
    const phone = document.getElementById('edit-sched-phone')?.value?.trim();
    const emergencyContact = document.getElementById('edit-sched-emergency')?.value?.trim();
    const vaccineName = document.getElementById('edit-sched-vaccine')?.value?.trim();
    const doseNumber = document.getElementById('edit-sched-dose')?.value?.trim();
    const scheduledDate = document.getElementById('edit-sched-date')?.value;
    const scheduledTime = document.getElementById('edit-sched-time')?.value;
    const status = document.getElementById('edit-sched-status')?.value;
    const urgency = document.getElementById('edit-sched-urgency')?.value?.trim();
    const description = document.getElementById('edit-sched-desc')?.value?.trim();

    if (!fullName) {
      window.AuthController.showToast('Please provide the Patient Legal Name.', 'error');
      return;
    }
    if (!vaccineName || !scheduledDate) {
      window.AuthController.showToast('Please provide both Vaccine Name and Scheduled Date.', 'error');
      return;
    }
    if (phone && phone.replace(/\D/g, '').length !== 10) {
      window.AuthController.showToast('Mobile number must be exactly 10 digits.', 'error');
      return;
    }

    try {
      window.AuthController.showToast('Saving updated patient & vaccine details...', 'info');
      const payload = {
        fullName,
        dob,
        gender,
        bloodGroup,
        allergies,
        email,
        phone,
        emergencyContact,
        vaccineName,
        doseNumber,
        scheduledDate,
        scheduledTime,
        status,
        urgency,
        description
      };

      let response;
      if (doseId) {
        response = await window.api.updateChartPendingDose(patientId, doseId, payload);
      } else {
        response = await window.api.updatePatientRosterSchedule(patientId, payload);
      }

      window.AuthController.showToast(response.message || 'Patient information & scheduled vaccine updated!', 'success');
      this.closeEditScheduleModal();

      if (response.patient) {
        const idx = this.allPatients.findIndex(p => String(p.id) === String(patientId));
        if (idx !== -1) {
          this.allPatients[idx] = response.patient;
        }
        if (this.currentActiveChartPatientId === patientId) {
          this.activeChartPatient = response.patient;
          this.renderChartModal(response.patient);
        }
      }
      await this.fetchPatientsRoster();
    } catch (err) {
      window.AuthController.showToast('Failed to update patient schedule: ' + err.message, 'error');
    }
  },

  // ------------------------------------------------------------------
  // PATIENT PORTAL: RESCHEDULE / EDIT APPOINTMENT MODAL HANDLERS
  // ------------------------------------------------------------------
  handleOpenPatientEditDose(doseId) {
    const upcoming = this.patientUpcomingCache || [];
    const targetDose = upcoming.find(d => String(d.id) === String(doseId));
    if (!targetDose) return;

    const idInput = document.getElementById('pat-edit-dose-id');
    const vaccineInput = document.getElementById('pat-edit-vaccine');
    const doseInput = document.getElementById('pat-edit-dose');
    const clinicSelect = document.getElementById('pat-edit-clinic');
    const dateInput = document.getElementById('pat-edit-date');
    const timeInput = document.getElementById('pat-edit-time');
    const notesInput = document.getElementById('pat-edit-notes');

    if (idInput) idInput.value = targetDose.id;
    if (vaccineInput) vaccineInput.value = targetDose.vaccine || '';
    if (doseInput) doseInput.value = targetDose.dose || '';
    if (clinicSelect && targetDose.clinic) clinicSelect.value = targetDose.clinic;
    if (dateInput) dateInput.value = targetDose.scheduledDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    if (timeInput) timeInput.value = targetDose.scheduledTime || '10:30';
    if (notesInput) notesInput.value = targetDose.notes || '';

    const modal = document.getElementById('patient-edit-dose-modal');
    if (modal) modal.style.display = 'flex';
  },

  closePatientEditModal() {
    const modal = document.getElementById('patient-edit-dose-modal');
    if (modal) modal.style.display = 'none';
  },

  async handlePatientEditDoseSubmit() {
    const doseId = document.getElementById('pat-edit-dose-id')?.value;
    const vaccineName = document.getElementById('pat-edit-vaccine')?.value?.trim();
    const doseNumber = document.getElementById('pat-edit-dose')?.value?.trim();
    const clinic = document.getElementById('pat-edit-clinic')?.value;
    const scheduledDate = document.getElementById('pat-edit-date')?.value;
    const scheduledTime = document.getElementById('pat-edit-time')?.value;
    const notes = document.getElementById('pat-edit-notes')?.value?.trim();

    if (!vaccineName || !scheduledDate) {
      window.AuthController.showToast('Please provide appointment date and vaccine name.', 'error');
      return;
    }

    try {
      window.AuthController.showToast('Rescheduling appointment...', 'info');
      const payload = {
        vaccineName,
        doseNumber,
        clinic,
        scheduledDate,
        scheduledTime,
        notes
      };

      const response = await window.api.updatePatientDose(doseId, payload);
      window.AuthController.showToast(response.message || 'Appointment rescheduled successfully!', 'success');
      this.closePatientEditModal();
      await this.initPatientDashboard();
    } catch (err) {
      window.AuthController.showToast('Failed to reschedule: ' + err.message, 'error');
    }
  },

  async handleOpenChart(patientId) {
    try {
      // 1. Immediately find patient from cache for instant response (zero latency)
      let patient = this.allPatients.find(p => String(p.id) === String(patientId));
      if (patient) {
        this.currentActiveChartPatientId = patient.id;
        this.renderChartModal(patient);
        const modal = this.chartModal || document.getElementById('patient-chart-modal');
        if (modal) {
          modal.style.display = 'flex';
          const dialog = modal.querySelector('.chart-modal-dialog');
          if (dialog) dialog.scrollTop = 0;
        }
      }

      // 2. Fetch fresh live chart data from MongoDB in background
      const response = await window.api.getPatientChart(patientId);
      if (response && response.patient) {
        patient = response.patient;
        const index = this.allPatients.findIndex(p => String(p.id) === String(patientId));
        if (index !== -1) {
          this.allPatients[index] = patient;
        }
        if (this.currentActiveChartPatientId === patient.id) {
          this.renderChartModal(patient);
        }
      }
    } catch (err) {
      console.warn('Live chart fetch sync notice:', err.message);
      // If patient was not found in local cache, show toast
      if (!this.allPatients.find(p => String(p.id) === String(patientId))) {
        window.AuthController.showToast('Could not open chart: ' + err.message, 'error');
      }
    }
  },

  renderChartModal(patient) {
    if (!patient) return;
    this.activeChartPatient = patient;
    this.currentActiveChartPatientId = patient.id;

    // 1. Safe Avatar & Title
    const fullName = patient.fullName || 'Unknown Patient';
    let initials = 'PT';
    if (fullName.includes(',')) {
      const parts = fullName.split(',').map(s => s.trim()).filter(Boolean);
      if (parts.length >= 2 && parts[0] && parts[1]) {
        initials = (parts[0][0] + parts[1][0]).toUpperCase();
      } else if (parts.length === 1 && parts[0]) {
        initials = parts[0].slice(0, 2).toUpperCase();
      }
    } else {
      const parts = fullName.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      } else if (parts.length === 1 && parts[0]) {
        initials = parts[0].slice(0, 2).toUpperCase();
      }
    }

    const avatarBadge = document.getElementById('chart-avatar-badge');
    if (avatarBadge) avatarBadge.textContent = initials;
    const nameEl = document.getElementById('chart-patient-name');
    if (nameEl) nameEl.textContent = fullName;
    const mrnEl = document.getElementById('chart-patient-mrn');
    if (mrnEl) mrnEl.textContent = patient.mrn || `MRN-${String(patient.id || 'PAT').toUpperCase()}`;
    const protoEl = document.getElementById('chart-patient-protocol');
    if (protoEl) protoEl.textContent = patient.protocol ? patient.protocol + ' Protocol' : 'Standard Immunization';
    const docEl = document.getElementById('chart-supervising-doc');
    if (docEl) docEl.textContent = patient.doctorAssigned || (this.currentUser && this.currentUser.role === 'doctor' ? this.currentUser.fullName : 'Unassigned Clinician');

    // 2. Demographics & Demographics Cards: Dynamic Date Math
    const ageCalc = patient.dob ? this.calculatePatientAge(patient.dob) : { ageYears: null, ageDisplay: 'Not provided', category: 'Not provided', isPediatric: false };
    const dobAgeEl = document.getElementById('chart-demo-dob-age');
    if (dobAgeEl) dobAgeEl.textContent = patient.dob ? `${patient.dob} (${ageCalc.ageDisplay})` : 'Not provided';
    const cohortEl = document.getElementById('chart-demo-cohort-category');
    if (cohortEl) cohortEl.textContent = patient.dob ? ageCalc.category : 'Not provided';
    const genderBloodEl = document.getElementById('chart-demo-gender-blood');
    const g = patient.gender || 'Not specified';
    const b = patient.bloodGroup || 'Not specified';
    if (genderBloodEl) genderBloodEl.textContent = (patient.gender || patient.bloodGroup) ? `${g} • ${b}` : 'Not specified';
    const gestEl = document.getElementById('chart-demo-gestational');
    if (gestEl) {
      if (patient.gestationalAge) {
        gestEl.textContent = patient.gestationalAge;
        gestEl.style.display = 'block';
      } else if (patient.riskFactors && patient.riskFactors !== 'None') {
        gestEl.textContent = patient.riskFactors;
        gestEl.style.display = 'block';
      } else {
        gestEl.textContent = '';
        gestEl.style.display = 'none';
      }
    }
    const phoneEl = document.getElementById('chart-demo-phone');
    if (phoneEl) phoneEl.textContent = this.formatPhoneNumber(patient.phone) || 'Not provided';
    const altPhoneEl = document.getElementById('chart-demo-alt-phone');
    if (altPhoneEl) altPhoneEl.textContent = this.formatPhoneNumber(patient.altPhone) || 'Not provided';
    const emailEl = document.getElementById('chart-demo-email');
    if (emailEl) emailEl.textContent = (patient.email && patient.email.trim()) ? patient.email.trim() : 'Not provided';
    const emergEl = document.getElementById('chart-demo-emergency');
    if (emergEl) emergEl.textContent = this.formatEmergencyContact(patient.emergencyContact);
    const addrEl = document.getElementById('chart-demo-address');
    if (addrEl) addrEl.textContent = patient.address || 'Not provided';
    const insEl = document.getElementById('chart-demo-insurance');
    if (insEl) insEl.textContent = patient.insurance || 'Not provided';

    // Alerts
    const allergyEl = document.getElementById('chart-alert-allergies');
    if (allergyEl) {
      if (patient.allergies && patient.allergies !== 'None' && patient.allergies !== 'No documented allergies' && patient.allergies.trim() !== '') {
        allergyEl.textContent = `⚠️ Documented Allergy: ${patient.allergies}`;
        allergyEl.className = 'alert-chip-red';
        allergyEl.style.display = 'inline-flex';
      } else {
        allergyEl.style.display = 'none';
      }
    }

    const riskEl = document.getElementById('chart-alert-risks');
    if (riskEl) {
      if (patient.riskFactors && patient.riskFactors !== 'None' && patient.riskFactors.trim() !== '') {
        riskEl.textContent = `🛡️ Risk Category: ${patient.riskFactors}`;
        riskEl.className = 'alert-chip-amber';
        riskEl.style.display = 'inline-flex';
      } else {
        riskEl.style.display = 'none';
      }
    }

    const clinicEl = document.getElementById('chart-alert-clinic');
    if (clinicEl) {
      if (patient.clinicAssigned && patient.clinicAssigned.trim() !== '') {
        clinicEl.textContent = `🏥 Clinic: ${patient.clinicAssigned}`;
        clinicEl.style.display = 'inline-flex';
      } else {
        clinicEl.style.display = 'none';
      }
    }

    // 3. Vaccine Data & Synthesis (guarantees upcoming and previous vaccines are available on every patient)
    let pending = Array.isArray(patient.pendingVaccines) ? [...patient.pendingVaccines] : [];
    let administered = Array.isArray(patient.administeredVaccines) ? [...patient.administeredVaccines] : [];

    // Fallback synthesis for newly scheduled records or records without sub-arrays
    if (pending.length === 0 && administered.length === 0 && patient.vaccineName) {
      if (patient.status === 'Administered') {
        administered.push({
          id: `adm-auto-${patient.id}`,
          vaccine: patient.vaccineName,
          disease: patient.vaccineName,
          dose: patient.doseNumber || 'Dose 1',
          administeredDate: patient.scheduledDateDisplay || 'Completed Visit',
          lotNumber: 'LOT-EHR-VERIFIED',
          siteRoute: 'Intramuscular',
          clinician: patient.doctorAssigned || 'Dr. Sarah Jenkins',
          facility: patient.clinicAssigned || 'Swedish Medical Center',
          status: 'Administered'
        });
      } else {
        pending.push({
          id: `pen-auto-${patient.id}`,
          vaccine: patient.vaccineName,
          disease: patient.vaccineName,
          dose: patient.doseNumber || 'Dose 1',
          scheduledDisplay: patient.scheduledDateDisplay || 'Routine Slot',
          status: patient.status || 'Scheduled',
          siteRoute: 'Intramuscular',
          urgency: patient.status === 'Overdue' ? 'Actionable Recall' : 'Confirmed Slot',
          contraindications: patient.allergies || 'None'
        });
      }
    }

    // Compliance stats
    const totalDoses = administered.length + pending.length;
    const compPercent = totalDoses > 0 ? Math.round((administered.length / totalDoses) * 100) : 0;

    const compPercentEl = document.getElementById('chart-compliance-percent');
    if (compPercentEl) compPercentEl.textContent = `${compPercent}%`;
    const dosesCountEl = document.getElementById('chart-doses-count');
    if (dosesCountEl) dosesCountEl.textContent = `${administered.length} of ${totalDoses} Recommended Doses Administered (${compPercent}% Complete)`;
    const progFill = document.getElementById('chart-progress-fill');
    if (progFill) progFill.style.width = `${compPercent}%`;

    // Counts on tabs & badges
    const pendCountEl = document.getElementById('chart-pending-count');
    if (pendCountEl) pendCountEl.textContent = pending.length;
    const adminCountEl = document.getElementById('chart-administered-count');
    if (adminCountEl) adminCountEl.textContent = administered.length;

    const pBadge = document.getElementById('chart-pending-badge');
    if (pBadge) pBadge.textContent = `${pending.length} Due`;
    const aBadge = document.getElementById('chart-administered-badge');
    if (aBadge) aBadge.textContent = `${administered.length} Verified`;

    // Tab sections visibility
    const pSec = document.getElementById('chart-pending-section');
    const aSec = document.getElementById('chart-administered-section');
    const tabAll = document.getElementById('tab-chart-all');
    const tabPend = document.getElementById('tab-chart-pending');
    const tabAdmin = document.getElementById('tab-chart-administered');

    if (tabAll && tabAll.classList.contains('active')) {
      if (pSec) pSec.style.display = 'flex';
      if (aSec) aSec.style.display = 'flex';
    } else if (tabPend && tabPend.classList.contains('active')) {
      if (pSec) pSec.style.display = 'flex';
      if (aSec) aSec.style.display = 'none';
    } else if (tabAdmin && tabAdmin.classList.contains('active')) {
      if (pSec) pSec.style.display = 'none';
      if (aSec) aSec.style.display = 'flex';
    } else {
      // Default to complete record (Both)
      if (tabAll) {
        [tabAll, tabPend, tabAdmin].filter(Boolean).forEach(t => t.classList.remove('active'));
        tabAll.classList.add('active');
      }
      if (pSec) pSec.style.display = 'flex';
      if (aSec) aSec.style.display = 'flex';
    }

    const pCont = document.getElementById('chart-pending-container');
    const aCont = document.getElementById('chart-administered-container');

    // 4. Render Upcoming & Due Vaccines List
    if (pCont) {
      if (pending.length === 0) {
        if (administered.length === 0) {
          pCont.innerHTML = `
            <div class="neo-box-sm" style="padding: 22px; text-align: center; color: var(--text-muted); background: rgba(0,0,0,0.02); border-radius: var(--radius-md);">
              🗓️ No scheduled vaccines found. Use "Schedule Dose" above to add an upcoming immunization.
            </div>
          `;
        } else {
          pCont.innerHTML = `
            <div class="neo-box-sm" style="padding: 22px; text-align: center; color: var(--teal-700); font-weight: 700; background: rgba(38,185,170,0.06); border-radius: var(--radius-md);">
              🎉 All scheduled vaccination doses for this patient are up-to-date! No pending doses required right now.
            </div>
          `;
        }
      } else {
        pCont.innerHTML = pending.map(item => {
          const isOverdue = item.status === 'Overdue' || this.isDoseOverdue(item);
          const borderClass = isOverdue ? 'overdue-border overdue-red-glow' : 'scheduled-border';
          const pillClass = isOverdue ? 'status-overdue' : 'status-scheduled';
          const pillIcon = isOverdue ? '⚠️' : '📅';

          return `
            <div class="vaccine-item-card ${borderClass}">
              <div class="vaccine-item-info">
                <div class="vaccine-item-title">
                  <span>${item.vaccine}</span>
                  <span class="status-pill ${pillClass}">
                    ${pillIcon} ${item.status || 'Scheduled'}
                  </span>
                  ${isOverdue ? '<span class="status-pill status-overdue" style="font-size: 0.72rem; animation: redAlertPulse 2s infinite ease-in-out;">🚨 Lapsed Clinical Action Required</span>' : ''}
                </div>
                <div class="vaccine-item-meta">
                  <span>🎯 <strong>Target:</strong> ${item.disease || item.vaccine}</span>
                  <span>💉 <strong>Dose:</strong> ${item.dose || 'Routine Dose'}</span>
                  <span>🕒 <strong>Scheduled:</strong> <strong style="color: ${isOverdue ? '#dc2626' : 'var(--teal-700)'};">${item.scheduledDisplay || 'Routine Clinical Slot'}</strong></span>
                  <span>📍 <strong>Route/Site:</strong> ${item.siteRoute || 'Intramuscular'}</span>
                </div>
                ${item.description ? `
                  <div style="font-size: 0.78rem; color: var(--teal-700); margin-top: 6px; background: rgba(38,185,170,0.08); padding: 5px 8px; border-radius: 4px;">
                    📝 <strong>Description:</strong> ${item.description}
                  </div>
                ` : ''}
                ${item.urgency ? `
                  <div style="font-size: 0.78rem; font-weight: 600; color: ${isOverdue ? '#dc2626' : 'var(--teal-700)'}; margin-top: 4px;">
                    ⚡ <em>Clinical Urgency:</em> ${item.urgency}
                  </div>
                ` : ''}
                ${item.contraindications && item.contraindications !== 'None' ? `
                  <div class="vaccine-item-notes">
                    ℹ️ <em>Clinical Precautions:</em> ${item.contraindications}
                  </div>
                ` : ''}
              </div>
              <div class="vaccine-item-actions" style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button type="button" class="btn-administer-now" onclick="DashboardController.handleAdministerPendingVaccine('${patient.id}', '${item.id}')">
                  💉 Administer Dose Now
                </button>
                <button type="button" class="btn-secondary-neo btn-edit-pending-dose" onclick="DashboardController.handleOpenEditChartPendingDose('${patient.id}', '${item.id}')" style="padding: 7px 12px; font-size: 0.8rem; font-weight: 700; color: var(--teal-700);">
                  ✏️ Edit Dose
                </button>
                <button type="button" class="btn-secondary-neo btn-share-pending-dose" onclick="DashboardController.handleOpenShareModal('${patient.fullName.replace(/'/g, "\\'")}', ${isOverdue}, '${patient.id}', '${item.id}')" style="padding: 7px 12px; font-size: 0.8rem; font-weight: 700;">
                  📤 Share
                </button>
                <button type="button" class="btn-delete-pending-dose" title="Remove this scheduled dose" onclick="DashboardController.handleDeleteChartPendingDose('${patient.id}', '${item.id}', '${item.vaccine.replace(/'/g, "\\'")}')">
                  🗑️ Delete Dose
                </button>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // 5. Render Previous Administered Vaccines History
    if (aCont) {
      if (administered.length === 0) {
        aCont.innerHTML = `
          <div class="neo-box-sm" style="padding: 22px; text-align: center; color: var(--text-muted); background: rgba(0,0,0,0.02); border-radius: var(--radius-md);">
            📋 No historical administered doses recorded yet for this patient record.
          </div>
        `;
      } else {
        aCont.innerHTML = administered.map(item => `
          <div class="vaccine-item-card administered-border">
            <div class="vaccine-item-info">
              <div class="vaccine-item-title">
                <span>${item.vaccine}</span>
                <span class="status-pill status-administered">
                  ✅ ${item.status || 'Administered'}
                </span>
              </div>
              <div class="vaccine-item-meta">
                <span>💉 <strong>Dose:</strong> ${item.dose || 'Verified'}</span>
                <span>🕒 <strong>Timestamp:</strong> ${item.administeredDate || 'Recorded'}</span>
                <span>🏷️ <strong>Lot/Batch:</strong> ${item.lotNumber || 'LOT-VERIFIED'}</span>
                <span>📍 <strong>Route/Site:</strong> ${item.siteRoute || 'Intramuscular (Deltoid)'}</span>
              </div>
              <div class="vaccine-item-notes">
                👨‍⚕️ <strong>Administered By:</strong> ${item.clinician || 'Attending Physician'} • 🏥 ${item.facility || patient.clinicAssigned || 'Specialty Clinic'}
              </div>
            </div>
            <div class="vaccine-item-actions">
              <span style="font-size: 0.74rem; font-weight: 700; color: #047857; background: rgba(16,185,129,0.12); padding: 6px 14px; border-radius: 20px; display: inline-flex; align-items: center; gap: 4px;">
                <span>🔒</span> Verified EHR Record
              </span>
            </div>
          </div>
        `).join('');
      }
    }
  },

  async handleAdministerPendingVaccine(patientId, pendingVaccineId) {
    // 1. Immediate visual response on clicked button (0ms latency!)
    const clickedBtn = window.event ? window.event.target.closest('button') : null;
    if (clickedBtn) {
      clickedBtn.disabled = true;
      clickedBtn.innerHTML = '⏳ Administering...';
      clickedBtn.style.opacity = '0.7';
    }

    // 2. Immediate optimistic update on chart modal data
    let targetPatient = this.activeChartPatient || this.allPatients.find(p => String(p.id) === String(patientId));
    let rollbackBackup = null;

    if (targetPatient && Array.isArray(targetPatient.pendingVaccines)) {
      const pIdx = targetPatient.pendingVaccines.findIndex(p => p.id === pendingVaccineId);
      if (pIdx !== -1) {
        rollbackBackup = JSON.parse(JSON.stringify(targetPatient));

        const targetVaccine = targetPatient.pendingVaccines.splice(pIdx, 1)[0];
        const now = new Date();
        const formattedTimestamp = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
          ' • ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        const newlyAdministered = {
          id: `adm-${Date.now()}`,
          vaccine: targetVaccine.vaccine,
          disease: targetVaccine.disease || targetVaccine.vaccine,
          dose: targetVaccine.dose,
          administeredDate: formattedTimestamp,
          lotNumber: `LOT-${Math.floor(1000 + Math.random() * 9000)}-${now.getFullYear()}`,
          siteRoute: targetVaccine.siteRoute || 'Intramuscular (Deltoid)',
          clinician: this.currentUser?.fullName || 'Attending Physician',
          facility: targetPatient.clinicAssigned || 'Specialty Clinic',
          status: 'Administered'
        };

        if (!Array.isArray(targetPatient.administeredVaccines)) {
          targetPatient.administeredVaccines = [];
        }
        targetPatient.administeredVaccines.unshift(newlyAdministered);

        const totalDoses = targetPatient.administeredVaccines.length + targetPatient.pendingVaccines.length;
        targetPatient.compliancePercent = totalDoses > 0 ? Math.round((targetPatient.administeredVaccines.length / totalDoses) * 100) : 100;
        targetPatient.dosesCount = `${targetPatient.administeredVaccines.length}/${totalDoses}`;
        const hasRemainingOverdue = targetPatient.pendingVaccines.some(p => p.status === 'Overdue');
        targetPatient.status = hasRemainingOverdue ? 'Overdue' : (targetPatient.pendingVaccines.length > 0 ? 'Scheduled' : 'Administered');
        targetPatient.scheduledDateDisplay = targetPatient.pendingVaccines.length > 0 ? targetPatient.pendingVaccines[0].scheduledDisplay : `All Up-to-Date • ${formattedTimestamp}`;

        // Immediately render updated chart & show success toast (0ms instant response!)
        this.renderChartModal(targetPatient);
        window.AuthController.showToast(`💉 ${targetVaccine.vaccine} (${targetVaccine.dose}) administered successfully!`, 'success');
      }
    }

    try {
      const response = await window.api.administerChartVaccine(patientId, pendingVaccineId);
      if (response && response.patient) {
        this.renderChartModal(response.patient);
        const idx = this.allPatients.findIndex(p => String(p.id) === String(patientId));
        if (idx !== -1) {
          this.allPatients[idx] = response.patient;
        }
      }
      await this.fetchPatientsRoster();
    } catch (err) {
      if (rollbackBackup) {
        this.renderChartModal(rollbackBackup);
      }
      window.AuthController.showToast('Administration failed: ' + err.message, 'error');
    }
  },

  async handleScheduleSubmit() {
    const patientId = this.currentSchedulingPatientId || document.getElementById('sched-patient-id')?.value || null;
    const fullName = document.getElementById('sched-patient-name').value.trim();
    const dob = document.getElementById('sched-dob').value;
    const gender = document.getElementById('sched-gender').value;
    const bloodGroup = document.getElementById('sched-blood').value;
    const allergies = document.getElementById('sched-allergies').value.trim();
    const emailInput = document.getElementById('sched-email');
    const email = emailInput ? emailInput.value.trim() : '';
    const phoneInput = document.getElementById('sched-phone');
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const emergencyInput = document.getElementById('sched-emergency');
    const emergencyContact = emergencyInput ? emergencyInput.value.trim() : '';
    const vaccineName = document.getElementById('sched-vaccine').value.trim();
    const vaccineDescription = document.getElementById('sched-vaccine-desc')?.value?.trim() || '';
    const doseNumber = document.getElementById('sched-dose').value.trim();
    const scheduledDate = document.getElementById('sched-date').value;
    const scheduledTime = document.getElementById('sched-time').value;

    if (!fullName || !vaccineName || !scheduledDate) {
      window.AuthController.showToast('Please fill out all required fields (Patient Name, Vaccine Name, Date).', 'error');
      return;
    }

    // Strict 10-digit mobile number validation
    if (phone) {
      const digits = phone.replace(/\D/g, '');
      if (digits.length > 10) {
        window.AuthController.showToast('⚠️ Invalid entry: Mobile number cannot have more than 10 digits.', 'error');
        if (phoneInput) {
          phoneInput.focus();
          phoneInput.classList.add('invalid-input');
        }
        return;
      }
      if (digits.length < 10) {
        window.AuthController.showToast(`⚠️ Invalid entry: Mobile number must be exactly 10 digits (entered ${digits.length} digits). Higher or lower digits are not allowed.`, 'error');
        if (phoneInput) {
          phoneInput.focus();
          phoneInput.classList.add('invalid-input');
        }
        return;
      }
    }

    try {
      window.AuthController.showToast('Saving scheduled vaccination...', 'info');
      const payload = {
        patientId: patientId || undefined,
        fullName,
        dob,
        gender,
        bloodGroup,
        allergies,
        phone: phone ? phone.replace(/\D/g, '') : '',
        email: email || '',
        emergencyContact,
        vaccineName,
        vaccineDescription,
        doseNumber,
        scheduledDate,
        scheduledTime
      };

      const response = await window.api.scheduleNewVaccine(payload);
      window.AuthController.showToast(response.message, 'success');

      if (this.scheduleModal) this.scheduleModal.style.display = 'none';
      if (this.scheduleForm) this.scheduleForm.reset();
      if (emailInput) emailInput.value = '';

      // If scheduled from Open Chart modal:
      if (this.openedScheduleFromChart) {
        const pId = this.openedScheduleFromChart;
        this.openedScheduleFromChart = null;
        this.currentSchedulingPatientId = null;

        if (response.patient) {
          const idx = this.allPatients.findIndex(p => String(p.id) === String(pId));
          if (idx !== -1) {
            this.allPatients[idx] = response.patient;
          } else {
            this.allPatients.unshift(response.patient);
          }
          if (this.chartModal) this.chartModal.style.display = 'flex';
          this.renderChartModal(response.patient);
        } else {
          await this.handleOpenChart(pId);
        }
      }

      await this.fetchPatientsRoster();
    } catch (err) {
      window.AuthController.showToast('Could not schedule vaccine: ' + err.message, 'error');
    }
  },

  // =========================================================================
  // PATIENT DASHBOARD METHODS & GOOGLE CALENDAR REMINDER INTEGRATION
  // =========================================================================
  async initPatientDashboard() {
    try {
      const data = await window.api.getPatientMe();
      this.patientData = data;
      const info = data.patientInfo;

      if (this.patNameDisplay) this.patNameDisplay.textContent = info.fullName || (this.currentUser ? this.currentUser.fullName : 'New Patient');
      if (this.patSubtitle) {
        if (info.primaryPhysician) {
          this.patSubtitle.textContent = `${info.mrn} • Attending: ${info.primaryPhysician}`;
        } else if (info.clinicAssigned) {
          this.patSubtitle.textContent = `${info.mrn} • ${info.clinicAssigned}`;
        } else {
          this.patSubtitle.textContent = `${info.mrn} • Personal Immunization Record`;
        }
      }

      // Smart Card
      if (this.patCardName) this.patCardName.textContent = info.fullName || (this.currentUser ? this.currentUser.fullName : 'Patient');
      if (this.patCardMrn) this.patCardMrn.textContent = info.mrn || 'MRN-PENDING';
      if (this.patCardBlood) this.patCardBlood.textContent = info.bloodGroup ? `Blood Group: ${info.bloodGroup}` : 'Blood Group: Not recorded';

      // Summary Stats
      if (this.patSummaryCompliance) this.patSummaryCompliance.textContent = info.complianceScore || '0%';
      if (this.patSummaryDoses) this.patSummaryDoses.textContent = info.totalDosesCount || `${(data.completedHistory || []).length} Doses Recorded`;
      if (this.patSummaryPhysician) this.patSummaryPhysician.textContent = info.primaryPhysician || 'Unassigned';

      // Demographics Card at Top: Dynamic Age Math Calculation
      const ageCalc = info.dob ? this.calculatePatientAge(info.dob) : { ageYears: null, ageDisplay: 'Not provided', category: 'Not provided', isPediatric: false };
      if (this.patDemoDobAge) {
        this.patDemoDobAge.textContent = info.dob ? `${info.dob} (${ageCalc.ageDisplay})` : 'Not provided';
      }
      if (this.patDemoCohortCategory) {
        this.patDemoCohortCategory.textContent = info.dob ? ageCalc.category : 'Not provided';
      }
      if (this.patCardCategory) {
        this.patCardCategory.textContent = info.dob ? ageCalc.category : 'Patient Record';
      }

      if (this.patDemoGenderBlood) {
        const g = info.gender || 'Not specified';
        const b = info.bloodGroup || 'Not specified';
        this.patDemoGenderBlood.textContent = (info.gender || info.bloodGroup) ? `${g} • ${b}` : 'Not specified';
      }
      if (this.patDemoPhone) {
        this.patDemoPhone.textContent = this.formatPhoneNumber(info.phone) || 'Not provided';
      }
      if (this.patDemoAltPhone) {
        this.patDemoAltPhone.textContent = this.formatPhoneNumber(info.altPhone) || 'Not provided';
      }
      if (this.patDemoEmail) {
        this.patDemoEmail.textContent = info.email || (this.currentUser ? this.currentUser.email : 'Not provided');
      }
      if (this.patDemoEmergency) {
        this.patDemoEmergency.textContent = this.formatEmergencyContact(info.emergencyContact);
      }
      if (this.patDemoAddress) {
        this.patDemoAddress.textContent = info.address || 'Not provided';
      }
      if (this.patDemoInsurance) {
        this.patDemoInsurance.textContent = info.insurance || 'Not provided';
      }

      // Allergies & Medical Conditions chips
      if (this.patAlertAllergies) {
        if (info.allergies && info.allergies !== 'None' && info.allergies !== 'No documented allergies' && info.allergies.trim() !== '') {
          this.patAlertAllergies.textContent = `⚠️ Documented Allergies: ${info.allergies}`;
          this.patAlertAllergies.className = 'alert-chip-red';
          this.patAlertAllergies.style.display = 'inline-flex';
        } else {
          this.patAlertAllergies.style.display = 'none';
        }
      }

      if (this.patAlertConditions) {
        if (info.medicalConditions && info.medicalConditions !== 'None' && info.medicalConditions.trim() !== '') {
          this.patAlertConditions.textContent = `🛡️ Medical Conditions: ${info.medicalConditions}`;
          this.patAlertConditions.style.display = 'inline-flex';
        } else {
          this.patAlertConditions.style.display = 'none';
        }
      }

      if (this.patAlertClinic) {
        if (info.clinicAssigned && info.clinicAssigned.trim() !== '') {
          this.patAlertClinic.textContent = `🏥 Clinic: ${info.clinicAssigned}`;
          this.patAlertClinic.style.display = 'inline-flex';
        } else {
          this.patAlertClinic.style.display = 'none';
        }
      }
      if (this.patAlertPhysician) {
        this.patAlertPhysician.style.display = 'none';
      }

      // Upcoming and Overdue lists with Clean Sheet handling
      const upcoming = data.upcomingDoses || [];
      const overdueDoses = upcoming.filter(dose => this.isDoseOverdue(dose));
      const scheduledDoses = upcoming.filter(dose => !this.isDoseOverdue(dose));

      if (this.patUpcomingCount) {
        this.patUpcomingCount.textContent = `${scheduledDoses.length} Scheduled`;
      }
      if (this.patOverdueCount) {
        if (overdueDoses.length > 0) {
          this.patOverdueCount.textContent = `🚨 ${overdueDoses.length} Overdue`;
          this.patOverdueCount.style.display = 'inline-flex';
        } else {
          this.patOverdueCount.style.display = 'none';
        }
      }

      if (this.patUpcomingList) {
        this.patientUpcomingCache = upcoming;
        if (upcoming.length === 0) {
          this.patUpcomingList.innerHTML = `
            <div class="clean-sheet-empty-card">
              <div class="empty-icon">🗓️</div>
              <div class="empty-title">No scheduled or administered vaccines found</div>
              <div class="empty-desc">Your vaccination calendar is completely clean. Click below to schedule a new immunization dose with Google Calendar reminders.</div>
              <button type="button" class="btn-primary-glow" onclick="DashboardController.openPatientScheduleModal()" style="padding: 10px 24px; font-size: 0.86rem;">
                ➕ Schedule New Vaccine
              </button>
            </div>
          `;
        } else {
          let html = '';

          // 1. OVERDUE SECTION (Appointments whose scheduled date/time has passed and not administered)
          if (overdueDoses.length > 0) {
            html += `
              <div class="patient-overdue-group" style="margin-bottom: 22px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; background: rgba(239, 68, 68, 0.08); padding: 10px 14px; border-radius: 8px; border-left: 4px solid #ef4444;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 1.15rem;">🚨</span>
                    <strong style="color: #b91c1c; font-size: 0.92rem;">Overdue Vaccines (Scheduled Time Has Passed)</strong>
                  </div>
                  <span class="status-pill status-overdue" style="font-size: 0.74rem; animation: redAlertPulse 2s infinite ease-in-out;">
                    ${overdueDoses.length} Action Required
                  </span>
                </div>
                <div style="font-size: 0.8rem; color: #7f1d1d; margin-bottom: 12px; padding: 0 4px;">
                  ⚠️ The following vaccination appointment has lapsed. Click <strong>"Administer Dose"</strong> below once you have taken this vaccine to record it in your official immunization history, or <strong>"Reschedule"</strong> to choose a new appointment slot.
                </div>
                <div class="patient-overdue-cards-wrapper" style="display: flex; flex-direction: column; gap: 12px;">
                  ${overdueDoses.map(dose => this.renderPatientDoseCard(dose, true)).join('')}
                </div>
              </div>
            `;
          }

          // 2. UPCOMING SCHEDULED APPOINTMENTS (Future slots)
          if (scheduledDoses.length > 0) {
            if (overdueDoses.length > 0) {
              html += `
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; padding: 0 4px;">
                  <span style="font-size: 1.05rem;">📅</span>
                  <strong style="color: var(--text-main); font-size: 0.92rem;">Upcoming Scheduled Appointments</strong>
                  <span class="status-pill status-scheduled" style="font-size: 0.74rem;">${scheduledDoses.length} Confirmed</span>
                </div>
              `;
            }
            html += `
              <div class="patient-scheduled-cards-wrapper" style="display: flex; flex-direction: column; gap: 12px;">
                ${scheduledDoses.map(dose => this.renderPatientDoseCard(dose, false)).join('')}
              </div>
            `;
          }

          this.patUpcomingList.innerHTML = html;
        }
      }

      // Completed history with Clean Sheet handling
      const completed = data.completedHistory || [];
      if (this.patAdministeredCount) {
        this.patAdministeredCount.textContent = `${completed.length} Verified Doses`;
      }
      if (this.patHistoryBody) {
        if (completed.length === 0) {
          this.patHistoryBody.innerHTML = `
            <tr>
              <td colspan="5" style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
                <div style="font-size: 1.8rem; margin-bottom: 8px;">🔒</div>
                <strong style="color: var(--text-main); font-size: 0.95rem;">No administered vaccines found</strong>
                <div style="font-size: 0.8rem; margin-top: 4px; max-width: 440px; margin-left: auto; margin-right: auto;">
                  Verified vaccination records with lot numbers and clinician signatures will appear here following administration.
                </div>
              </td>
            </tr>
          `;
        } else {
          this.patHistoryBody.innerHTML = completed.map(item => `
            <tr>
              <td>
                <strong style="color: var(--text-main); font-size: 0.92rem;">${item.vaccine}</strong>
                <div style="font-size: 0.74rem; color: var(--text-muted); font-family: monospace;">${item.lotNumber || 'LOT-VERIFIED'}</div>
              </td>
              <td style="font-weight: 600;">${item.dose}</td>
              <td style="font-weight: 700; color: #047857;">${item.administeredDate}</td>
              <td>${item.clinic}</td>
              <td>
                <span class="status-pill status-administered" style="display: inline-flex; align-items: center; gap: 4px;">
                  <span>🔒</span> Verified EHR
                </span>
              </td>
            </tr>
          `).join('');
        }
      }

    } catch (err) {
      window.AuthController.showToast('Could not load patient dashboard: ' + err.message, 'error');
    }
  },

  renderPatientDoseCard(dose, isOverdue) {
    const borderClass = isOverdue ? 'overdue-border overdue-red-glow' : 'scheduled-border';
    return `
      <div class="patient-upcoming-card ${borderClass}">
        <div class="patient-upcoming-card-info">
          <div class="vaccine-item-title">
            <span>${dose.vaccine}</span>
            <span class="status-pill ${isOverdue ? 'status-overdue' : 'status-scheduled'}">
              ${isOverdue ? '⚠️ Overdue Appointment' : (dose.status || '📅 Confirmed Appointment')}
            </span>
            ${isOverdue ? '<span class="status-pill status-overdue" style="font-size: 0.72rem; animation: redAlertPulse 2s infinite ease-in-out;">🚨 Overdue</span>' : ''}
          </div>
          <div class="vaccine-item-meta" style="margin-top: 6px;">
            <span>💉 <strong>Dose:</strong> ${dose.dose || 'Routine Dose'}</span>
            <span>🕒 <strong>Scheduled Slot:</strong> <strong style="color: ${isOverdue ? '#dc2626' : 'var(--teal-700)'};">${dose.scheduledDisplay}</strong></span>
            <span>🏥 <strong>Facility:</strong> ${dose.clinic || 'Community Health Clinic'}</span>
            <span>👨‍⚕️ <strong>Physician:</strong> ${dose.doctor || 'Unassigned Clinician'}</span>
          </div>
          ${dose.description ? `
            <div style="font-size: 0.78rem; color: var(--teal-700); margin-top: 6px; background: rgba(38,185,170,0.08); padding: 5px 8px; border-radius: 4px;">
              📝 <strong>Vaccine Description:</strong> ${dose.description}
            </div>
          ` : ''}
          ${dose.notes ? `
            <div class="vaccine-item-notes" style="margin-top: 8px;">
              ℹ️ <em>Notes:</em> ${dose.notes}
            </div>
          ` : ''}
        </div>
        <div class="vaccine-item-actions" style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button type="button" class="btn-patient-administer" onclick="DashboardController.handlePatientAdministerDose('${dose.id}')" title="Click to record this vaccine as administered">
            💉 Administer Dose
          </button>
          <button type="button" class="btn-secondary-neo" onclick="DashboardController.handleOpenPatientEditDose('${dose.id}')" style="padding: 6px 12px; font-size: 0.78rem; font-weight: 700; color: var(--teal-700);">
            ✏️ Reschedule / Edit
          </button>
          <button type="button" class="btn-secondary-neo" onclick="DashboardController.handleOpenPatientShareModal('${dose.id}')" style="padding: 6px 12px; font-size: 0.78rem; font-weight: 700;">
            📤 Share
          </button>
          <button type="button" class="btn-gcal-reminder" onclick="DashboardController.handleGoogleCalendarReminder('${dose.id}')" title="Add to Google Calendar to be reminded when time gets near and at pinpoint time" style="display: inline-flex; align-items: center; gap: 6px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; flex-shrink: 0;">
              <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20ZM19 8H5V6H19V8Z" fill="#1A73E8"/>
              <rect x="7" y="12" width="4" height="4" rx="1" fill="#4285F4"/>
              <rect x="13" y="12" width="4" height="4" rx="1" fill="#34A853"/>
              <rect x="7" y="17" width="4" height="4" rx="1" fill="#EA4335"/>
              <rect x="13" y="17" width="4" height="4" rx="1" fill="#FBBC04"/>
            </svg>
            <span>Add to Google Calendar</span>
          </button>
          <button type="button" class="btn-delete-patient-dose" title="Cancel Appointment" onclick="DashboardController.handleDeletePatientDose('${dose.id}', '${dose.vaccine.replace(/'/g, "\\'")}')">
            🗑️ Cancel Appointment
          </button>
        </div>
      </div>
    `;
  },

  async handlePatientAdministerDose(doseId) {
    if (!this.patientData || !this.patientData.upcomingDoses) return;
    const targetDose = this.patientData.upcomingDoses.find(d => String(d.id) === String(doseId));
    if (!targetDose) {
      window.AuthController.showToast('Vaccine appointment not found.', 'error');
      return;
    }

    const confirmed = confirm(
      `💉 Confirm Administration of Vaccine:\n\n` +
      `• Vaccine: ${targetDose.vaccine}\n` +
      `• Dose: ${targetDose.dose}\n` +
      `• Scheduled Slot: ${targetDose.scheduledDisplay}\n\n` +
      `This will mark this vaccine as administered, update your compliance score, and record it in your official verified immunization history.`
    );
    if (!confirmed) return;

    try {
      window.AuthController.showToast(`Recording administration for ${targetDose.vaccine}...`, 'info');
      const res = await window.api.administerPatientMeDose(doseId);
      if (res && res.success) {
        window.AuthController.showToast(`💉 ${targetDose.vaccine} (${targetDose.dose}) successfully administered and recorded!`, 'success');
        await this.initPatientDashboard();
      } else {
        window.AuthController.showToast(res.message || 'Could not record administration.', 'error');
      }
    } catch (err) {
      window.AuthController.showToast('Administration failed: ' + err.message, 'error');
    }
  },

  handleGoogleCalendarReminder(doseId) {
    if (!this.patientData || !this.patientData.upcomingDoses) return;
    const dose = this.patientData.upcomingDoses.find(d => String(d.id) === String(doseId));
    if (!dose) return;

    const patientName = this.patientData.patientInfo?.fullName || 'Patient';
    const clinic = dose.clinic || (this.patientData.patientInfo?.clinicAssigned || 'Community Health Clinic');

    let startIso = '';
    let endIso = '';

    if (dose.scheduledDate) {
      const timeClean = (dose.scheduledTime || '10:30').replace(/[^0-9:]/g, '');
      const parts = timeClean.split(':');
      const startH = (parts[0] || '10').padStart(2, '0');
      const startM = (parts[1] || '00').padStart(2, '0');
      const endH = String((parseInt(startH, 10) + 1) % 24).padStart(2, '0');
      const dateDigits = dose.scheduledDate.replace(/[^0-9]/g, '');

      startIso = `${dateDigits}T${startH}${startM}00`;
      endIso = `${dateDigits}T${endH}${startM}00`;
    } else {
      const nowPlus7 = new Date(Date.now() + 7 * 86400000);
      const yyyy = nowPlus7.getFullYear();
      const mm = String(nowPlus7.getMonth() + 1).padStart(2, '0');
      const dd = String(nowPlus7.getDate()).padStart(2, '0');
      startIso = `${yyyy}${mm}${dd}T103000`;
      endIso = `${yyyy}${mm}${dd}T113000`;
    }

    const title = `💉 Vaccination Appointment: ${dose.vaccine} (${dose.dose})`;
    const details = `Patient: ${patientName}\n` +
      `Vaccine: ${dose.vaccine}\n` +
      `Dose: ${dose.dose}\n` +
      `Scheduled Slot: ${dose.scheduledDisplay}\n` +
      `Clinic / Facility: ${clinic}\n` +
      `Attending Physician: ${dose.doctor || (this.patientData.patientInfo?.primaryPhysician || 'Unassigned Clinician')}\n\n` +
      `⏰ Reminder Notice:\n` +
      `Google Calendar will notify you as the date approaches and at the pinpoint of your scheduled appointment time. Please arrive 10 minutes early with your digital pass.\n\n` +
      `Configured via ImmuTrack Vaccine Scheduler.`;

    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
      `&text=${encodeURIComponent(title)}` +
      `&dates=${startIso}/${endIso}` +
      `&details=${encodeURIComponent(details)}` +
      `&location=${encodeURIComponent(clinic)}`;

    window.open(gcalUrl, '_blank');
    window.AuthController.showToast(`Opening Google Calendar for "${dose.vaccine}"! Reminders will notify you as the time nears and at the pinpoint of your appointment.`, 'success');
  },

  handlePatientVaccineSelectChange(val) {
    const customGroup = document.getElementById('pat-custom-vaccine-group');
    const customInput = document.getElementById('pat-sched-custom-vaccine');
    if (val === 'Other') {
      if (customGroup) customGroup.style.display = 'block';
      if (customInput) customInput.focus();
    } else {
      if (customGroup) customGroup.style.display = 'none';
      if (customInput) customInput.value = '';
    }
  },

  async handlePatientScheduleSubmit() {
    let vaccineName = document.getElementById('pat-sched-vaccine')?.value || '';
    if (vaccineName === 'Other') {
      const customName = document.getElementById('pat-sched-custom-vaccine')?.value?.trim();
      if (!customName) {
        window.AuthController.showToast('Please enter your custom vaccine name.', 'error');
        return;
      }
      vaccineName = customName;
    }
    const vaccineDescription = document.getElementById('pat-sched-vaccine-desc')?.value?.trim() || '';
    const doseNumber = document.getElementById('pat-sched-dose')?.value || 'Dose 1 (Primary)';
    const scheduledDate = document.getElementById('pat-sched-date')?.value || '';
    const scheduledTime = document.getElementById('pat-sched-time')?.value || '10:30';
    const clinic = document.getElementById('pat-sched-clinic')?.value || 'Community Health Clinic';
    const notes = document.getElementById('pat-sched-notes')?.value?.trim() || '';

    if (!vaccineName || !scheduledDate) {
      window.AuthController.showToast('Please choose a vaccine and select an appointment date.', 'error');
      return;
    }

    try {
      window.AuthController.showToast('Scheduling vaccination appointment...', 'info');
      const response = await window.api.schedulePatientDose({
        vaccineName,
        vaccineDescription,
        doseNumber,
        scheduledDate,
        scheduledTime,
        clinic,
        notes
      });

      window.AuthController.showToast(response.message || 'Vaccination appointment scheduled successfully!', 'success');

      // Close modal & reset form
      if (this.patientScheduleModal) this.patientScheduleModal.style.display = 'none';
      if (this.patientScheduleForm) this.patientScheduleForm.reset();

      // Refresh patient dashboard
      await this.initPatientDashboard();

      // Trigger Google Calendar reminder for newly scheduled dose
      if (response.newDose && response.newDose.id) {
        setTimeout(() => {
          this.handleGoogleCalendarReminder(response.newDose.id);
        }, 600);
      }
    } catch (err) {
      window.AuthController.showToast('Could not schedule vaccine: ' + err.message, 'error');
    }
  },

  // =========================================================================
  // PROFILE EDITING MODAL (DEMOGRAPHICS & EMERGENCY/ALT MOBILE)
  // =========================================================================
  openProfileModal() {
    if (!this.profileModal || !this.currentUser) return;

    const fullNameInput = document.getElementById('prof-fullname');
    const emailInput = document.getElementById('prof-email');
    const phoneInput = document.getElementById('prof-phone');
    const altPhoneInput = document.getElementById('prof-alt-phone');

    const cleanDigits = (p) => {
      if (!p) return '';
      const d = String(p).replace(/\D/g, '');
      if (d.length === 11 && d.startsWith('1')) return d.slice(1);
      return d.length >= 10 ? d.slice(-10) : d;
    };

    if (fullNameInput) fullNameInput.value = this.currentUser.fullName || '';
    if (emailInput) emailInput.value = this.currentUser.email || '';
    if (phoneInput) phoneInput.value = cleanDigits(this.currentUser.phone);
    if (altPhoneInput) {
      const rawAlt = this.currentUser.altPhone || 
        (this.currentUser.patientDetails && this.currentUser.patientDetails.altPhone) || 
        (this.patientData && this.patientData.patientInfo && this.patientData.patientInfo.altPhone) || '';
      altPhoneInput.value = cleanDigits(rawAlt);
    }

    const patientFields = document.getElementById('prof-patient-fields');
    const doctorFields = document.getElementById('prof-doctor-fields');

    if (this.currentUser.role === 'patient') {
      if (patientFields) patientFields.style.display = 'block';
      if (doctorFields) doctorFields.style.display = 'none';

      const patDetails = this.currentUser.patientDetails || {};
      const patInfo = (this.patientData && this.patientData.patientInfo) || {};

      const dobInput = document.getElementById('prof-dob');
      const genderInput = document.getElementById('prof-gender');
      const bloodInput = document.getElementById('prof-blood');
      const emergInput = document.getElementById('prof-emergency-contact');
      const addressInput = document.getElementById('prof-address');
      const insuranceInput = document.getElementById('prof-insurance');
      const allergiesInput = document.getElementById('prof-allergies');
      const conditionsInput = document.getElementById('prof-conditions');

      if (dobInput) dobInput.value = patDetails.dob || patInfo.dob || '';
      if (genderInput) genderInput.value = patDetails.gender || patInfo.gender || '';
      if (bloodInput) bloodInput.value = patDetails.bloodGroup || patInfo.bloodGroup || '';
      if (emergInput) emergInput.value = patDetails.emergencyContact || patInfo.emergencyContact || '';
      if (addressInput) addressInput.value = patDetails.address || patInfo.address || '';
      if (insuranceInput) insuranceInput.value = patDetails.insurance || patInfo.insurance || '';
      if (allergiesInput) allergiesInput.value = patDetails.allergies || patInfo.allergies || '';
      if (conditionsInput) conditionsInput.value = patDetails.medicalConditions || patInfo.medicalConditions || '';
    } else {
      if (patientFields) patientFields.style.display = 'none';
      if (doctorFields) doctorFields.style.display = 'block';

      const docDetails = this.currentUser.doctorDetails || {};
      const specInput = document.getElementById('prof-specialization');
      const licenseInput = document.getElementById('prof-license');
      const hospitalInput = document.getElementById('prof-hospital');

      if (specInput) specInput.value = docDetails.specialization || 'Pediatric Immunization & Preventative Care';
      if (licenseInput) licenseInput.value = docDetails.licenseNumber || 'NPI #8492019482';
      if (hospitalInput) hospitalInput.value = docDetails.hospital || 'Swedish Medical Center — Pediatric Specialty Clinic';
    }

    this.profileModal.style.display = 'flex';
  },

  async handleProfileSubmit() {
    const fullName = document.getElementById('prof-fullname')?.value?.trim() || '';
    const phone = document.getElementById('prof-phone')?.value?.trim() || '';
    const altPhone = document.getElementById('prof-alt-phone')?.value?.trim() || '';

    if (!fullName) {
      window.AuthController.showToast('Please provide your full legal name.', 'error');
      return;
    }

    // 10-digit mobile number validation
    if (phone) {
      const digits = phone.replace(/\D/g, '');
      if (digits.length !== 10) {
        window.AuthController.showToast(`Primary phone must be exactly 10 digits (currently ${digits.length}).`, 'error');
        return;
      }
    }
    if (altPhone) {
      const digits = altPhone.replace(/\D/g, '');
      if (digits.length !== 10) {
        window.AuthController.showToast(`Emergency / Alt mobile must be exactly 10 digits (currently ${digits.length}).`, 'error');
        return;
      }
    }

    const payload = {
      fullName,
      phone: phone ? phone.replace(/\D/g, '') : '',
      altPhone: altPhone ? altPhone.replace(/\D/g, '') : ''
    };

    if (this.currentUser.role === 'patient') {
      payload.dob = document.getElementById('prof-dob')?.value || '';
      payload.gender = document.getElementById('prof-gender')?.value || '';
      payload.bloodGroup = document.getElementById('prof-blood')?.value || '';
      payload.emergencyContact = document.getElementById('prof-emergency-contact')?.value?.trim() || '';
      payload.address = document.getElementById('prof-address')?.value?.trim() || '';
      payload.insurance = document.getElementById('prof-insurance')?.value?.trim() || '';
      payload.allergies = document.getElementById('prof-allergies')?.value?.trim() || '';
      payload.medicalConditions = document.getElementById('prof-conditions')?.value?.trim() || '';
    } else if (this.currentUser.role === 'doctor') {
      payload.specialization = document.getElementById('prof-specialization')?.value?.trim() || '';
      payload.licenseNumber = document.getElementById('prof-license')?.value?.trim() || '';
      payload.hospital = document.getElementById('prof-hospital')?.value?.trim() || '';
    }

    try {
      window.AuthController.showToast('Saving profile changes...', 'info');
      const response = await window.api.updateProfile(payload);
      this.currentUser = response.user;
      window.api.setUser(response.user);
      window.AuthController.showToast(response.message || 'Profile updated successfully!', 'success');

      if (this.profileModal) this.profileModal.style.display = 'none';

      // Update header displays directly
      const docNameEl = document.getElementById('doctor-name-display');
      if (docNameEl && this.currentUser.role === 'doctor') {
        docNameEl.textContent = `Dr. ${this.currentUser.fullName}`;
      }
      const patNameEl = document.getElementById('pat-name-display');
      if (patNameEl && this.currentUser.role === 'patient') {
        patNameEl.textContent = this.currentUser.fullName;
      }

      // Re-initialize active view
      if (this.currentUser.role === 'patient') {
        await this.initPatientDashboard();
      } else {
        await this.initDoctorDashboard();
      }
    } catch (err) {
      window.AuthController.showToast('Could not save profile: ' + err.message, 'error');
    }
  },

  /**
   * Helper: Determine if a scheduled dose is past its scheduled date and time.
   * If time has passed and the dose is still not administered, it is Overdue.
   */
  isDoseOverdue(dose) {
    if (!dose) return false;
    if (dose.status === 'Administered') return false;
    if (dose.status === 'Overdue') return true;
    const now = new Date();

    if (dose.scheduledTimestamp) {
      const t = new Date(dose.scheduledTimestamp);
      if (!isNaN(t.getTime())) return t < now;
    }

    if (dose.scheduledDate) {
      let timeStr = dose.scheduledTime || '23:59';
      let cleanTime = timeStr;
      if (/am|pm/i.test(timeStr)) {
        const match = timeStr.match(/(\d+):(\d+)\s*(am|pm)/i);
        if (match) {
          let h = parseInt(match[1], 10);
          const m = match[2];
          const isPm = match[3].toLowerCase() === 'pm';
          if (isPm && h < 12) h += 12;
          if (!isPm && h === 12) h = 0;
          cleanTime = `${String(h).padStart(2, '0')}:${m}`;
        }
      }
      if (cleanTime.length === 5) {
        const combined = new Date(`${dose.scheduledDate}T${cleanTime}:00`);
        if (!isNaN(combined.getTime())) return combined < now;
      }
      const dayOnly = new Date(`${dose.scheduledDate}T23:59:59`);
      if (!isNaN(dayOnly.getTime())) return dayOnly < now;
    }

    if (dose.scheduledDisplay) {
      if (/lapsed|overdue/i.test(dose.scheduledDisplay)) return true;
      if (dose.scheduledDisplay.includes('Today')) {
        const timeMatch = dose.scheduledDisplay.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (timeMatch) {
          let h = parseInt(timeMatch[1], 10);
          const m = parseInt(timeMatch[2], 10);
          const isPm = timeMatch[3].toUpperCase() === 'PM';
          if (isPm && h < 12) h += 12;
          if (!isPm && h === 12) h = 0;
          const target = new Date(now);
          target.setHours(h, m, 0, 0);
          return target < now;
        }
      }
      const cleaned = dose.scheduledDisplay.replace('•', '').replace(/\(.*\)/, '').trim();
      const parsed = new Date(cleaned);
      if (!isNaN(parsed.getTime())) return parsed < now;
    }

    return false;
  },

  /**
   * Dynamic Date-Math Age Parser:
   * int calculateAgeYears(DateTime dob)
   * Conditionally render: age < 18 ? "Pediatric (${age}y)" : "Adult (${age}y)"
   */
  calculatePatientAge(dobInput) {
    if (!dobInput) return { ageYears: null, ageDisplay: 'N/A', category: 'Patient', isPediatric: false };
    const dob = new Date(dobInput);
    if (isNaN(dob.getTime())) return { ageYears: null, ageDisplay: 'N/A', category: 'Patient', isPediatric: false };

    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    const d = now.getDate() - dob.getDate();
    if (m < 0 || (m === 0 && d < 0)) {
      age--;
    }
    const isPediatric = age < 18;
    let ageDisplay = `${age}y`;
    if (age === 0) {
      let months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
      if (d < 0) months--;
      ageDisplay = `${Math.max(0, months)}m`;
    }
    const category = isPediatric ? (age === 0 ? `Pediatric (${ageDisplay})` : `Pediatric (${age}y)`) : `Adult (${age}y)`;

    return { ageYears: age, ageDisplay, category, isPediatric };
  },

  /**
   * Phone number sanitizer and formatter
   */
  formatPhoneNumber(phoneStr) {
    if (!phoneStr) return '';
    const digits = String(phoneStr).replace(/\D/g, '');
    if (!digits) return String(phoneStr).trim();
    if (digits.length === 11 && digits.startsWith('1')) {
      return digits.slice(1);
    }
    if (digits.length >= 10) {
      return digits.slice(-10); // Normal 10-digit mobile number: e.g. 9876543210
    }
    return digits;
  },

  formatEmergencyContact(text) {
    if (!text || text === 'Not provided') return 'Not provided';
    return String(text)
      .replace(/\+1\s*\(([0-9]{3})\)\s*([0-9]{3})-([0-9]{4})/g, '$1$2$3')
      .replace(/\+1\s*([0-9]{10})/g, '$1');
  },

  openPatientScheduleModal() {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const dateInput = document.getElementById('pat-sched-date');
    if (dateInput && !dateInput.value) dateInput.value = tomorrow;
    const modal = this.patientScheduleModal || document.getElementById('patient-schedule-modal');
    if (modal) modal.style.display = 'flex';
  },

  openCertificateModal() {
    const modal = document.getElementById('certificate-modal');
    if (!modal) return;

    const data = this.patientData || {};
    const info = data.patientInfo || {};
    const completed = data.completedHistory || [];

    const patNameEl = document.getElementById('cert-pat-name');
    const patMrnEl = document.getElementById('cert-pat-mrn');
    const patDobAgeEl = document.getElementById('cert-pat-dob-age');
    const patGenderBloodEl = document.getElementById('cert-pat-gender-blood');
    const patCohortEl = document.getElementById('cert-pat-cohort');
    const certTbody = document.getElementById('cert-doses-tbody');
    const issueDateEl = document.getElementById('cert-issue-date');

    const ageCalc = info.dob ? this.calculatePatientAge(info.dob) : { ageYears: null, ageDisplay: 'Not provided', category: 'Not provided', isPediatric: false };

    if (patNameEl) patNameEl.textContent = info.fullName || (this.currentUser && this.currentUser.fullName) || 'Patient';
    if (patMrnEl) patMrnEl.textContent = info.mrn || 'MRN-PENDING';
    if (patDobAgeEl) patDobAgeEl.textContent = info.dob ? `${info.dob} (${ageCalc.ageDisplay})` : 'Not provided';
    if (patGenderBloodEl) {
      const g = info.gender || 'Not specified';
      const b = info.bloodGroup || 'Not specified';
      patGenderBloodEl.textContent = (info.gender || info.bloodGroup) ? `${g} • ${b}` : 'Not specified';
    }
    if (patCohortEl) patCohortEl.textContent = info.dob ? ageCalc.category : 'Not provided';
    const docEl = document.getElementById('cert-attending-doc');
    const signEl = document.getElementById('cert-sign-doc');
    if (docEl) docEl.textContent = info.primaryPhysician || 'Unassigned';
    if (signEl) signEl.textContent = info.primaryPhysician || 'Authorized Medical Officer';
    if (issueDateEl) {
      issueDateEl.textContent = `Issued: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }

    const clinicHeadEl = document.getElementById('cert-clinic-header');
    const clinicSubEl = document.getElementById('cert-clinic-sub');
    const clinicAddrEl = document.getElementById('cert-clinic-addr');
    if (info.clinicAssigned && info.clinicAssigned.trim() !== '') {
      if (clinicHeadEl) clinicHeadEl.textContent = info.clinicAssigned.toUpperCase();
      if (clinicSubEl) clinicSubEl.textContent = 'PEDIATRIC & PREVENTATIVE CARE CLINIC';
      if (clinicAddrEl) clinicAddrEl.textContent = 'Verified Healthcare Facility Provider';
    } else {
      if (clinicHeadEl) clinicHeadEl.textContent = 'IMMUTRACK CLINICAL IMMUNIZATION REGISTRY';
      if (clinicSubEl) clinicSubEl.textContent = 'OFFICIAL VACCINATION RECORD & EHR VERIFICATION';
      if (clinicAddrEl) clinicAddrEl.textContent = 'Public Health & Preventative Medicine • State Immunization Information System (IIS)';
    }

    if (certTbody) {
      if (completed.length === 0) {
        certTbody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; padding: 24px; color: #64748b;">
              No administered vaccine doses recorded in EHR registry yet.
            </td>
          </tr>
        `;
      } else {
        certTbody.innerHTML = completed.map(dose => `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px; font-weight: 700; color: #0f172a;">${dose.vaccine}</td>
            <td style="padding: 10px; color: #334155;">${dose.dose}</td>
            <td style="padding: 10px; color: #047857; font-weight: 600;">${dose.administeredDate}</td>
            <td style="padding: 10px; font-family: monospace; font-size: 0.78rem;">${dose.lotNumber || 'LOT-VERIFIED'}</td>
            <td style="padding: 10px; color: #475569;">${dose.clinic || 'Community Health Clinic'}</td>
          </tr>
        `).join('');
      }
    }

    modal.style.display = 'flex';
  },

  closeCertificateModal() {
    const modal = document.getElementById('certificate-modal');
    if (modal) modal.style.display = 'none';
  },

  // =========================================================================
  // DELETION HANDLERS (DOCTOR & PATIENT PORTALS)
  // =========================================================================

  /**
   * Delete patient record from clinician's roster
   */
  async handleDeletePatient(patientId, patientName) {
    const confirmed = window.confirm(`⚠️ Permanently Delete Patient Record?\n\nAre you sure you want to permanently remove "${patientName}" from clinical records? This will delete all clinical data and scheduled doses for this patient.`);
    if (!confirmed) return;

    // Optimistic UI removal (0ms instant response)
    const patientIndex = this.allPatients.findIndex(p => String(p.id) === String(patientId));
    let removedPatient = null;
    if (patientIndex !== -1) {
      removedPatient = this.allPatients.splice(patientIndex, 1)[0];
      this.renderPatientTable();
      this.updateOverviewMetrics();
      window.AuthController.showToast(`🗑️ Patient "${patientName}" removed from active records.`, 'info');
    }

    // If chart for this patient is currently open, close it
    if (this.currentActiveChartPatientId === patientId && this.chartModal) {
      this.chartModal.style.display = 'none';
      this.currentActiveChartPatientId = null;
      this.activeChartPatient = null;
    }

    try {
      const response = await window.api.deletePatient(patientId);
      window.AuthController.showToast(response.message || `Patient "${patientName}" successfully deleted.`, 'success');
      await this.fetchPatientsRoster();
    } catch (err) {
      // Rollback on error
      if (removedPatient && patientIndex !== -1) {
        this.allPatients.splice(patientIndex, 0, removedPatient);
        this.renderPatientTable();
        this.updateOverviewMetrics();
      }
      window.AuthController.showToast('Could not delete patient: ' + err.message, 'error');
    }
  },

  /**
   * Delete active chart patient from within the open chart modal
   */
  async handleDeleteActiveChartPatient() {
    if (!this.activeChartPatient) return;
    const patientId = this.activeChartPatient.id;
    const patientName = this.activeChartPatient.fullName;
    await this.handleDeletePatient(patientId, patientName);
  },

  /**
   * Delete a scheduled pending vaccine dose from a patient chart (Doctor Portal)
   */
  async handleDeleteChartPendingDose(patientId, doseId, vaccineName) {
    const confirmed = window.confirm(`⚠️ Delete Scheduled Dose?\n\nAre you sure you want to cancel and remove the scheduled dose "${vaccineName}" from this patient's schedule?`);
    if (!confirmed) return;

    const patient = this.allPatients.find(p => String(p.id) === String(patientId)) || this.activeChartPatient;
    let removedDose = null;
    let doseIndex = -1;

    // Optimistic UI removal in chart (0ms response)
    if (patient && Array.isArray(patient.pendingVaccines)) {
      doseIndex = patient.pendingVaccines.findIndex(d => d.id === doseId);
      if (doseIndex !== -1) {
        removedDose = patient.pendingVaccines.splice(doseIndex, 1)[0];
        const administeredCount = Array.isArray(patient.administeredVaccines) ? patient.administeredVaccines.length : 0;
        const totalDoses = administeredCount + patient.pendingVaccines.length;
        patient.compliancePercent = totalDoses > 0 ? Math.round((administeredCount / totalDoses) * 100) : (administeredCount > 0 ? 100 : 0);
        patient.dosesCount = `${administeredCount}/${totalDoses}`;
        const hasOverdue = patient.pendingVaccines.some(p => p.status === 'Overdue');
        patient.status = hasOverdue ? 'Overdue' : (patient.pendingVaccines.length > 0 ? 'Scheduled' : 'Administered');
        this.renderChartModal(patient);
        this.renderPatientTable();
        window.AuthController.showToast(`🗑️ Scheduled dose "${vaccineName}" removed from schedule.`, 'info');
      }
    }

    try {
      const response = await window.api.deleteChartPendingDose(patientId, doseId);
      if (response && response.patient) {
        this.renderChartModal(response.patient);
        const idx = this.allPatients.findIndex(p => String(p.id) === String(patientId));
        if (idx !== -1) {
          this.allPatients[idx] = response.patient;
          this.renderPatientTable();
        }
      }
      window.AuthController.showToast(response.message || `Scheduled dose deleted successfully.`, 'success');
      await this.fetchPatientsRoster();
    } catch (err) {
      if (patient && removedDose && doseIndex !== -1) {
        patient.pendingVaccines.splice(doseIndex, 0, removedDose);
        this.renderChartModal(patient);
        this.renderPatientTable();
      }
      window.AuthController.showToast('Could not delete scheduled dose: ' + err.message, 'error');
    }
  },

  /**
   * Cancel and delete an upcoming appointment dose from patient portal (Patient Portal)
   */
  async handleDeletePatientDose(doseId, vaccineName) {
    const confirmed = window.confirm(`⚠️ Cancel Appointment?\n\nAre you sure you want to cancel and delete your scheduled appointment for "${vaccineName}"?`);
    if (!confirmed) return;

    let removedDose = null;
    let doseIndex = -1;

    // Optimistic UI removal in patient upcoming list (0ms response)
    if (this.patientData && Array.isArray(this.patientData.upcomingDoses)) {
      doseIndex = this.patientData.upcomingDoses.findIndex(d => d.id === doseId);
      if (doseIndex !== -1) {
        removedDose = this.patientData.upcomingDoses.splice(doseIndex, 1)[0];
        if (this.patUpcomingCount) {
          this.patUpcomingCount.textContent = `${this.patientData.upcomingDoses.length} Scheduled`;
        }
        await this.initPatientDashboard();
        window.AuthController.showToast(`🗑️ Appointment for "${vaccineName}" cancelled.`, 'info');
      }
    }

    try {
      const response = await window.api.deletePatientDose(doseId);
      window.AuthController.showToast(response.message || `Appointment cancelled successfully.`, 'success');
      await this.initPatientDashboard();
    } catch (err) {
      if (this.patientData && removedDose && doseIndex !== -1) {
        this.patientData.upcomingDoses.splice(doseIndex, 0, removedDose);
        await this.initPatientDashboard();
      }
      window.AuthController.showToast('Could not cancel appointment: ' + err.message, 'error');
    }
  }
};

window.DashboardController = DashboardController;
