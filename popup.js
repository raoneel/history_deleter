const btnClear = document.getElementById("btnClear");
const btnDryRun = document.getElementById("btnDryRun");
const log = document.getElementById("log");

// Start time is 2 years ago
// TODO: Make this configurable
const startTime = new Date().getTime() - 2 * 365 * 24 * 60 * 60 * 1000;

function deleteWithQueryPromise(query) {
  return new Promise((resolve, reject) => {
    chrome.history.search({ text: query, startTime }, function (results) {
      results.forEach(function (result) {
        chrome.history.deleteUrl({ url: result.url });
      });

      // Resolve with the number of deleted items
      resolve(results.length);
    });
  });
}

// Dry run prints out URLS without deleting them
function dryRun(query) {
  clearLog();

  if (!query) {
    logError("Query is required");
    return;
  }

  log.innerHTML += `<b>Dry run for query: ${query} (first 100 results). These items were not deleted. Press Delete to delete them.</b><br/><br/>`;
  chrome.history.search({ text: query, startTime }, function (results) {
    results.forEach(function (result) {
      log.innerHTML += `${result.url}<br/>`;
    });
  });
}

function clearLog() {
  log.innerHTML = "";
}

function logError(error) {
  clearLog();
  log.innerHTML += `<b>Error: ${error}</b><br/><br/>`;
}

async function main(query) {
  clearLog();

  if (!query) {
    logError("Query is required");
    return;
  }

  // Delete in a loop until there are no more results
  let deletedCount = 0;
  do {
    const count = await deleteWithQueryPromise(query);
    log.innerHTML += `Deleted ${count} items<br/>`;
    deletedCount = count;
  } while (deletedCount > 0);
}

btnClear.addEventListener("click", () => {
  const input = document.getElementById("query");
  const query = input.value;
  main(query);
});

btnDryRun.addEventListener("click", () => {
  const input = document.getElementById("query");
  const query = input.value;
  dryRun(query);
});
