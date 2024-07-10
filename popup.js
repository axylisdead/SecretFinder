document.addEventListener('DOMContentLoaded', function () {
  const resultsTable = document.getElementById('resultsTable');

  chrome.storage.local.get('results', function (data) {
    if (data.results && data.results.length > 0) {
      data.results.forEach(result => {
        const row = document.createElement('tr');

        const urlCell = document.createElement('td');
        urlCell.textContent = result.url;
        row.appendChild(urlCell);

        const matchCell = document.createElement('td');
        matchCell.textContent = result.match;
        row.appendChild(matchCell);

        resultsTable.appendChild(row);
      });
    } else {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.setAttribute('colspan', '2');
      cell.textContent = 'No secrets found';
      row.appendChild(cell);
      resultsTable.appendChild(row);
    }
  });
});
