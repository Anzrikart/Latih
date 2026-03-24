/**
 * modules/grade-chart.js
 * Renders a line chart of a student's grade history using Chart.js.
 * Requires: assets/js/chart.min.js, assets/js/latih.js
 */

const GradeChart = (() => {
  let _chartInst = null;
  let _ready = false;

  function init(mountId, userId) {
    const mount = document.getElementById(mountId);
    if (!mount) return;

    // Destroy existing chart if re-rendering
    if (_chartInst) {
      _chartInst.destroy();
      _chartInst = null;
    }

    const grades = Store.get('grades_' + userId) || [];
    if (grades.length === 0) {
      mount.innerHTML = ''; // Hide chart area entirely if no data
      return;
    }

    if (!_ready) {
      _ready = true;
      _injectCSS();
    }

    // Prepare container
    mount.innerHTML = `
      <div class="gc-wrap">
        <div class="gc-head">
          <div class="section-title">Prestasi Markah (%)</div>
        </div>
        <div class="gc-canvas-wrap">
          <canvas id="gradeChartCanvas"></canvas>
        </div>
      </div>
    `;

    // Process data: take up to last 10 records chronologically
    // LocalStorage grades are chronological (appended).
    const recent = grades.slice(-10);
    const labels = recent.map((g, i) => `Ujian ${i + 1}`);
    const data   = recent.map(g => g.pct);
    const colors = recent.map(g => getGrade(g.pct).color);

    const ctx = document.getElementById('gradeChartCanvas').getContext('2d');
    
    // Set global font
    Chart.defaults.font.family = "'DM Sans', sans-serif";
    Chart.defaults.color = "#6B6760"; // var(--text3)

    _chartInst = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Markah (%)',
          data: data,
          borderColor: '#2B5CE6', // var(--accent)
          backgroundColor: '#2B5CE620', // accent with opacity
          borderWidth: 3,
          pointBackgroundColor: colors, // dynamic based on A/B/C/D/E
          pointBorderColor: '#FFF',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          fill: true,
          tension: 0.3 // smooth curves
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { top: 10, right: 10, left: 0, bottom: 0 }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1C1917', // var(--text)
            titleFont: { size: 13, family: "'DM Sans', sans-serif" },
            bodyFont: { size: 14, weight: 'bold', family: "'DM Sans', sans-serif" },
            padding: 10,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: (ctx) => {
                const g = recent[ctx.dataIndex];
                return `${g.pct}% (${getGrade(g.pct).grade}) - ${g.subject}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            grid: {
              color: '#E6E4E1', // var(--border)
              drawBorder: false,
            },
            ticks: {
              stepSize: 20,
              font: { size: 11, weight: '600' }
            }
          },
          x: {
            grid: { display: false, drawBorder: false },
            ticks: { font: { size: 11, weight: '600' } }
          }
        }
      }
    });
  }

  function _injectCSS() {
    if (document.getElementById('gc-css')) return;
    const s = document.createElement('style');
    s.id = 'gc-css';
    s.textContent = `
    .gc-wrap {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 20px;
      box-shadow: var(--shadow);
      margin-bottom: 24px;
      animation: fadeIn 0.3s ease;
    }
    .gc-head { margin-bottom: 16px; }
    .gc-canvas-wrap { position: relative; height: 220px; width: 100%; }
    `;
    document.head.appendChild(s);
  }

  return { init };
})();
