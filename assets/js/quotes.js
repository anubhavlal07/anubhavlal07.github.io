const quoteElement = document.getElementById("quote");

// Fetch and display quote
const fetchQuote = async () => {
  try {
    const currentDate = new Date().toLocaleDateString();
    const storedQuote = localStorage.getItem(currentDate);

    if (storedQuote) {
      quoteElement.innerHTML = `
        <div>
          <h3 class="homeInfoTitle">Quote of the day</h3>
          <span class="homeInfoDescription">${storedQuote}</span>
        </div>`;
    } else {
      const response = await fetch("https://quotes-api-et4v.onrender.com/quote");
      if (response.ok) {
        const data = await response.json();
        const quote = `${data.quote} - ${data.author}`;
        // console.log(quote);
        quoteElement.innerHTML = `
          <div>
            <h3 class="homeInfoTitle">Quote of the day</h3>
            <span class="homeInfoDescription">${quote}</span>
          </div>`;
        localStorage.setItem(currentDate, quote);
      } else {
        console.error("Error: " + response.status);
      }
    }
  } catch (error) {
    console.error("Error fetching quote:", error);
  }
};

// Refresh at midnight
const setMidnightRefresh = () => {
  const now = new Date();
  const millisUntilMidnight =
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0) - now;

  setTimeout(() => {
    localStorage.removeItem(new Date().toLocaleDateString());
    fetchQuote();
    setMidnightRefresh(); // Repeat for next midnight
  }, millisUntilMidnight);
};

// Initial load
fetchQuote();
setMidnightRefresh();
