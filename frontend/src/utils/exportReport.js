/**
 * Generates and downloads a clean CSV file from the combined analytics state data.
 * @param {Object} data 
 */
export const exportReportToCSV = (data) => {
  let csvContent = "data:text/csv;charset=utf-8,";

  // Title block
  csvContent += `AssetFlow Enterprise Management - Operational Analytics Report\n`;
  csvContent += `Generated On: ${new Date().toLocaleString()}\n\n`;

  // Section 1: Department Utilization
  if (data.utilization) {
    csvContent += "ASSET UTILIZATION BY DEPARTMENT\n";
    csvContent += "Department Name,Utilization Count\n";
    data.utilization.forEach(row => {
      csvContent += `"${row.name}",${row.value}\n`;
    });
    csvContent += "\n";
  }

  // Section 2: Maintenance Frequency
  if (data.maintenanceFrequency) {
    csvContent += "MAINTENANCE FREQUENCY OVER TIME\n";
    csvContent += "Month/Timeline,Incident Count\n";
    data.maintenanceFrequency.forEach(row => {
      csvContent += `"${row.label}",${row.count}\n`;
    });
    csvContent += "\n";
  }

  // Section 3: Most Used Assets
  if (data.mostUsed) {
    csvContent += "MOST USED ASSETS\n";
    csvContent += "Asset Description,Usage Metric\n";
    data.mostUsed.forEach(row => {
      csvContent += `"${row.label}","${row.metric}"\n`;
    });
    csvContent += "\n";
  }

  // Section 4: Idle Assets
  if (data.idle) {
    csvContent += "IDLE ASSETS LIST\n";
    csvContent += "Asset Description,Idle Duration\n";
    data.idle.forEach(row => {
      csvContent += `"${row.label}","${row.metric}"\n`;
    });
    csvContent += "\n";
  }

  // Section 5: Maintenance Due / Nearing Retirement
  if (data.maintenanceDue) {
    csvContent += "MAINTENANCE DUE / NEARING RETIREMENT ALERTS\n";
    csvContent += "Asset Description,Alert Reason\n";
    data.maintenanceDue.forEach(row => {
      csvContent += `"${row.label}","${row.metric}"\n`;
    });
    csvContent += "\n";
  }

  // Section 6: Allocation Summary
  if (data.allocationSummary) {
    csvContent += "DEPARTMENT ALLOCATION SUMMARY\n";
    csvContent += "Department Name,Currently Allocated Count\n";
    data.allocationSummary.forEach(row => {
      csvContent += `"${row.department}",${row.allocatedCount}\n`;
    });
  }

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `AssetFlow_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
