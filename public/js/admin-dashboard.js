
async function updateChart(orders) {
  const timeFilter = document.getElementById('timeFilter');
  if(!timeFilter) return;
  const selectedOption = timeFilter.value;
  const salesData = { labels: [], counts: [], revenue: [] };

  switch (selectedOption) {
    case 'daily':
      for (let hour = 0; hour < 24; hour++) {
        const startHour = moment().startOf('day').add(hour, 'hours');
        const endHour = moment(startHour).endOf('hour');
        salesData.labels.push(startHour.format('HH:mm'));

        const hourlyOrders = orders.filter(order =>
          moment(order.createdAt).isBetween(startHour, endHour)
        );
        salesData.counts.push(hourlyOrders.length);
        salesData.revenue.push(hourlyOrders.reduce((total, order) => total + order.grandTotal, 0));
      }
      break;

    case 'weekly':
      const weekStart = moment().startOf('isoWeek');
      for (let i = 0; i < 7; i++) {
        const day = moment(weekStart).add(i, 'days');
        salesData.labels.push(day.format('dddd'));

        const dailyOrders = orders.filter(order => moment(order.createdAt).isSame(day, 'day'));
        salesData.counts.push(dailyOrders.length);
        salesData.revenue.push(dailyOrders.reduce((total, order) => total + order.grandTotal, 0));
      }
      break;

    case 'monthly':
      const monthStart = moment().startOf('month');
      const monthEnd = moment().endOf('month');
      let currentWeekStart = moment(monthStart);
      let weekNum = 1;

      while (currentWeekStart.isBefore(monthEnd)) {
        let currentWeekEnd = moment(currentWeekStart).add(6, 'days').endOf('day');
        if (currentWeekEnd.isAfter(monthEnd)) {
          currentWeekEnd = monthEnd; // Cap at end of month
        }

        salesData.labels.push(`Week ${weekNum}`);

        const weeklyOrders = orders.filter(order =>
          moment(order.createdAt).isBetween(currentWeekStart, currentWeekEnd, 'day', '[]')
        );
        salesData.counts.push(weeklyOrders.length);
        salesData.revenue.push(weeklyOrders.reduce((total, order) => total + order.grandTotal, 0));

        currentWeekStart.add(7, 'days');
        weekNum++;
      }
      break;

    case 'yearly':
      const yearStart = moment().startOf('year');
      for (let month = 0; month < 12; month++) {
        const monthStart = moment(yearStart).add(month, 'months');
        salesData.labels.push(monthStart.format('MMMM'));

        const monthlyOrders = orders.filter(order => moment(order.createdAt).isSame(monthStart, 'month'));
        salesData.counts.push(monthlyOrders.length);
        salesData.revenue.push(monthlyOrders.reduce((total, order) => total + order.grandTotal, 0));
      }
      break;
  }

  if(window.salesChart) {
    window.salesChart.updateOptions({
      series: [
        { name: 'Order Count', data: salesData.counts },
        { name: 'Revenue', data: salesData.revenue }
      ],
      xaxis: { categories: salesData.labels }
    });
  }
}

// Function to handle predefined time period filter changes
async function handleTimeFilterChange() {
  const selectedOption = document.getElementById('timeFilter').value;
  await fetchSalesReport(`/admin/sales-report?period=${selectedOption}`);
}

// Function to handle custom date range filter changes
async function handleCustomDateRangeChange() {
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  if (!startDate || !endDate) {
    // Optionally create a toast here
    return;
  }

  await fetchSalesReport(`/admin/sales-report?startDate=${startDate}&endDate=${endDate}`);
}

async function fetchSalesReport(urlParams) {
  try {
    const response = await fetch(urlParams);
    const data = await response.json();

    if (data.success) {
      const { orders, salesReport } = data;
      updateDashboard(salesReport);
      updateTable('salesReport', orders);
      updateTable('transaction', orders);
      updateChart(orders);
    } else {
      alert('Failed to fetch sales report.');
    }
  } catch (error) {
    console.error('Error fetching sales report:', error);
    alert('An error occurred while fetching the sales report.');
  }
}

// Function to update the UI with the fetched summary data
function updateDashboard(salesReport) {
  const report = salesReport[0] || { totalSalesAmount: 0, totalOrders: 0, totalDiscounts: 0, totalShipping: 0 };
  const revenueEl = document.getElementById('revenue');
  const totalOrdersEl = document.getElementById('total-orders');
  const totalDiscountsEl = document.getElementById('total-discounts');
  
  if(revenueEl) revenueEl.textContent = `\u20B9${report.totalSalesAmount.toFixed(2)}`;
  if(totalOrdersEl) totalOrdersEl.textContent = report.totalOrders;
  if(totalDiscountsEl) totalDiscountsEl.textContent = `\u20B9${report.totalDiscounts.toFixed(2)}`;
}

// Generic function to update any table with order data
function updateTable(tableType, orders) {
  let tableBody;

  if (tableType === 'salesReport') {
    tableBody = document.querySelector("#salesReportTableBody");
  } else if (tableType === 'transaction') {
    tableBody = document.querySelector("#transactionTableBody");
  } else {
    console.error("Invalid table type");
    return;
  }
  
  if(!tableBody) return;

  // Clear existing rows
  tableBody.innerHTML = '';

  if (orders.length === 0) {
    const emptyMessage = tableType === 'salesReport'
      ? '<tr><td colspan="8">No orders found for the selected period.</td></tr>'
      : '<tr><td colspan="5">No transactions found for the selected period.</td></tr>';
    tableBody.innerHTML = emptyMessage;
    return;
  }

  // Populate table with order data based on table type
  orders.forEach(order => {
    const row = document.createElement("tr");
    row.classList.add("align-middle", "table-row");

    // Helper for capitalization
    const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

    if (tableType === 'salesReport') {
      row.innerHTML = `
      <td class="text-start"><a href="/admin/orders?orderId=${order._id}" target="_blank">${order._id}</a></td>
      <td>${order.items.length}</td>
      <td>${capitalizeFirstLetter(order.paymentMethod)}</td>
      <td>${capitalizeFirstLetter(order.paymentStatus)}</td>
      <td>&#8377;${order.couponDiscount || 0}</td>
      <td>&#8377;${order.grandTotal.toFixed(2)}</td>
      <td>${new Date(order.createdAt).toLocaleDateString()}</td>
      <td>${capitalizeFirstLetter(order.orderStatus)}</td>
      `;
    } else if (tableType === 'transaction') {
      row.innerHTML = `
      <td class="text-start">${order.userId.firstName}</td>
      <td>${capitalizeFirstLetter(order.paymentMethod)}</td>
      <td>&#8377;${order.grandTotal.toFixed(2)}</td>
      <td>${new Date(order.createdAt).toLocaleDateString()}</td>
      <td>${capitalizeFirstLetter(order.paymentStatus)}</td>
      `;
    }

    tableBody.appendChild(row);
  });
}

document.addEventListener('DOMContentLoaded', () => {
    // Chart initialization
    const options = {
        series: [
          { name: 'Order Count', data: [] },
          { name: 'Revenue', data: [] }
        ],
        chart: {
          height: 350,
          type: 'area',
          animations: {
            enabled: true,
            easing: 'easein',
            speed: 800,
            animateGradually: {
              enabled: true,
              delay: 150
            },
            dynamicAnimation: {
              enabled: true,
              speed: 350
            }
          }
        },
        colors: ['#CED4DC', '#000000'],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth' },
        xaxis: { categories: [] },
        yaxis: [
          {
            title: { text: 'Order Count' },
            labels: { style: { colors: '#CED4DC' } },
            opposite: false
          },
          {
            title: { text: 'Revenue' },
            labels: { style: { colors: '#000000' } },
            opposite: true
          }
        ],
        tooltip: { x: { format: 'dd/MM/yy HH:mm' } },
        grid: { show: false },
    };

    const chartEl = document.querySelector("#chart");
    if(chartEl) {
        window.salesChart = new ApexCharts(chartEl, options);
        window.salesChart.render();
    }

    // Event listeners for filter changes
    const timeFilter = document.getElementById('timeFilter');
    if(timeFilter) {
        timeFilter.addEventListener('change', handleTimeFilterChange);
        // Initial load
        handleTimeFilterChange();
    }
    
    document.getElementById('startDate')?.addEventListener('change', handleCustomDateRangeChange);
    document.getElementById('endDate')?.addEventListener('change', handleCustomDateRangeChange);

    document.getElementById('pdfBtn')?.addEventListener('click', () => {
        const selectedOption = document.getElementById('timeFilter').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        window.location.href = selectedOption
          ? `/admin/sales-report/download/pdf?period=${selectedOption}`
          : `/admin/sales-report/download/pdf?startDate=${startDate}&endDate=${endDate}`;
    });

    document.getElementById('excelBtn')?.addEventListener('click', () => {
        const selectedOption = document.getElementById('timeFilter').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        window.location.href = selectedOption
          ? `/admin/sales-report/download/excel?period=${selectedOption}`
          : `/admin/sales-report/download/excel?startDate=${startDate}&endDate=${endDate}`;
    });

    // Best Sellers Logic in same file or separate? Let's keep specific logic here
    document.querySelector('.best-seller-card')?.addEventListener('click', async () => {
        try {
          const response = await fetch('/admin/best-selling');
          const data = await response.json();

          // Populate Products Table
          const productsTableBody = document.getElementById('topProductsTable').querySelector('tbody');
          productsTableBody.innerHTML = data.topProducts
            .map(product => `
          <tr>
            <td class="text-start">${product.productDetails.name}</td>
            <td>${product.productDetails.brand}</td>
            <td>${product.totalSold}</td>
          </tr>
        `)
            .join('');

          // Populate Categories Table
          const categoriesTableBody = document.getElementById('topCategoriesTable').querySelector('tbody');
          categoriesTableBody.innerHTML = data.topCategories
            .map(category => `
          <tr>
            <td class="text-start">${category.subCategoryDetails.name}</td>
            <td>${category.parentCategoryDetails.name}</td>
            <td>${category.totalSold}</td>
          </tr>
        `)
            .join('');

          // Show Modal
          const modalEl = document.getElementById('topTenModal');
          if(modalEl) {
             new bootstrap.Modal(modalEl).show();
          }
        } catch (error) {
          console.error('Error fetching top-selling data:', error);
        }
    });

});
