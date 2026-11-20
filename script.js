//RESTAURANT API - Adrress of the restaurant data
const apiUrl = "https://media2.edu.metropolia.fi/restaurant/api/v1/restaurants";

// FAVOURITES - Load saved restaurant IDs from browser storage
const favourites = (
  JSON.parse(localStorage.getItem("favourites")) || []
).filter((id) => typeof id === "string" && id.length > 0);

// Save the cleaned favourites
localStorage.setItem("favourites", JSON.stringify(favourites));

// WEEKLY MENU - BAse URL for weekly menus
const weeklyApiUrl =
  "https://media2.edu.metropolia.fi/restaurant/api/v1/restaurants/weekly";

//FETCH - Ask the API for restaurant information
fetch(apiUrl)
  .then((response) => response.json())
  .then((restaurants) => {
    // Find the HTML container where restaurants will appear
    const restaurantList = document.getElementById("restaurant-list");

    // SEARCH -Find the search input
    const searchInput = document.getElementById("restaurant-search");
    // FAVOURITES - FInd the navigation link
    const favouritesLink = document.getElementById("favourites-link");
    // RESTAURANTS - Get the Restaurants navigation link
    const restaurantsLink = document.getElementById("restaurants-link");

    // FAVOURITES - Show only saved restaurants
    favouritesLink.addEventListener("click", (event) => {
      event.preventDefault();

      const cards = restaurantList.querySelectorAll(".restaurant-card");

      cards.forEach((card) => {
        const heart = card.querySelector(".favourite-btn");
        const restaurantID = heart.dataset.id;

        if (favourites.includes(restaurantID)) {
          card.style.display = "";
        } else {
          card.style.display = "none";
        }
      });

      // FAVOURITES - Show a message when no restaurants are saved
      const emptyFavourites = document.getElementById("empty-favourites");

      emptyFavourites.style.display =
        favourites.length === 0 ? "block" : "none";
    });

    // RESTAURANTS - Show all restaurant again
    restaurantsLink.addEventListener("click", () => {
      const cards = restaurantList.querySelectorAll(".restaurant-card");

      cards.forEach((card) => {
        card.style.display = "";
      });
      // Hide the empty favourites message
      document.getElementById("empty-favourites").style.display = "none";
    });

    // DISPLAY - Clear the restaurant container
    restaurantList.innerHTML = "";

    // LOOP - Create a card for every restaurant & daily and weekly menu button
    restaurants.forEach((restaurant) => {
      restaurantList.innerHTML += `
        <div class="restaurant-card">
        <h3>${restaurant.name}</h3>
        <p>${restaurant.city}</p>

        <button class="favourite-btn ${favourites.includes(restaurant._id) ? "active" : ""}"
        data-id="${restaurant._id}"
        >
        ${favourites.includes(restaurant._id) ? "♥" : "♡"}
        </button>

        <div class="menu-options">
        <button class="menu-btn daily-btn" data-id="${restaurant._id}">Daily Menu</button>
        <button class="menu-btn weekly-btn" data-id="${restaurant._id}">Weekly Menu</button>
        </div>

        <div class="menu-popup"></div> 

     </div>
    `;
    });

    // SEARCH - Filter restaurants while typing
    searchInput.addEventListener("input", () => {
      console.log("Searching:", searchInput.value);
      const searchText = searchInput.value.toLowerCase();

      const cards = restaurantList.querySelectorAll(".restaurant-card");

      cards.forEach((card) => {
        const restaurantname = card
          .querySelector("h3")
          .textContent.toLowerCase();
        const restaurantCity = card
          .querySelector("p")
          .textContent.toLowerCase();

        if (
          restaurantname.includes(searchText) ||
          restaurantCity.includes(searchText)
        ) {
          card.style.display = "";
        } else {
          card.style.display = "none";
        }
      });

      // Count visible restaurant cards
      const visibleCards = [...cards].filter(
        (card) => card.style.display !== "none",
      );

      // Find the no-results message
      const noResults = document.getElementById("no-results");
      console.log("No results element:", noResults);
      console.log("visible restaurants:", visibleCards.length);

      // Show the message only when no restaurants match
      noResults.style.display = visibleCards.length === 0 ? "block" : "none";
    });

    // FAVOURITES - Change the heart when clicked
    restaurantList.addEventListener("click", (event) => {
      // Check id a favourite heart was clicked
      if (event.target.matches(".favourite-btn")) {
        const heart = event.target;

        // Get the selected restaurant ID
        const restaurantID = heart.dataset.id;
        console.log("Favourite restaurant ID:", restaurantID);

        // Add or remove the restaurant from favourites
        if (favourites.includes(restaurantID)) {
          favourites.splice(favourites.indexOf(restaurantID), 1);
        } else {
          favourites.push(restaurantID);
        }

        // Save the updated favourites in the browser
        localStorage.setItem("favourites", JSON.stringify(favourites));

        // FAVOURITES - Update heart based on saved favourites
        const isFavourite = favourites.includes(restaurantID);

        // Add or remove the active class
        heart.classList.toggle("active", isFavourite);

        // Change the heart symbol
        heart.textContent = isFavourite ? "♥" : "♡";
      }
    });

    // HOVER - Show the popup when the mouse enters Daily Menu
    restaurantList.addEventListener("mouseover", (event) => {
      if (event.target.matches(".daily-btn[data-id]")) {
        const restaurantCard = event.target.closest(".restaurant-card");
        const menuPopup = restaurantCard.querySelector(".menu-popup");

        // Show popup only if mouse is still inside the restaurant card
        if (restaurantCard.matches(":hover")) {
          menuPopup.style.display = "block";
        } else {
          menuPopup.style.display = "none";
        }
      }
    });

    // HIDE POPUP - When the mouse leaves the restaurant card
    restaurantList.addEventListener("mouseout", (event) => {
      const restaurantCard = event.target.closest(".restaurant-card");

      if (restaurantCard && !restaurantCard.contains(event.relatedTarget)) {
        // Find the popup inside this restaurant card
        const menuPopup = restaurantCard.querySelector(".menu-popup");

        // Hide the popup
        menuPopup.style.display = "none";
      }
    });

    // MENU BUTTON - Listen for clicks on restaurant cards
    restaurantList.addEventListener("mouseover", (event) => {
      // Check whether the clicked element is a Daily Menu button
      if (event.target.matches(".daily-btn[data-id]")) {
        // Get the restaurant ID stored in the button
        const restaurantId = event.target.dataset.id;

        //   Find the restaurant card containing the clicked button
        const restaurantCard = event.target.closest(".restaurant-card");

        // Find the floating menu popup inside the selected restaurant card
        const menuResult = restaurantCard.querySelector(".menu-popup");

        console.log("Selected restaurant ID:", restaurantId);

        // DAILY MENU - Request the selected restaurant's menu
        fetch(
          `https://media2.edu.metropolia.fi/restaurant/api/v1/restaurants/daily/${restaurantId}/fi`,
        )
          .then((response) => response.json())
          .then((menu) => {
            console.log("Daily Menu:", menu);

            //   DISPLAY - Clear the previous menu
            menuResult.innerHTML = "";

            //  LOOP - Display all dishes and their prices
            menu.courses.forEach((food) => {
              // Create a paragraph for each dish
              const paragraph = document.createElement("p");

              // Show the price only when available
              paragraph.textContent = `${food.name}
                ${food.price ? " - " + food.price : ""}
              ${food.diets ? " (" + food.diets + ")" : ""}`;

              // Add the dish to the popup
              menuResult.appendChild(paragraph);
            });

            if (menu.courses.length === 0) {
              menuResult.textContent =
                "No daily menu available for this restaurant.";
            }
          });
      }
    });

    // WeekLY MENU - Detect mouse hover
    restaurantList.addEventListener("mouseover", (event) => {
      if (event.target.matches(".weekly-btn")) {
        const restaurantId = event.target.dataset.id;

        console.log("Weekly Menu Restaurant ID:", restaurantId);

        // WEEKLY MENU - Fetch menu for the selected restaurant
        fetch(`${weeklyApiUrl}/${restaurantId}/fi`)
          .then((response) => response.json())
          .then((weeklyMenu) => {
            console.log("Weekly Menu Data:", weeklyMenu);
            console.log("IS weekly menu an array?", Array.isArray(weeklyMenu));
            console.log("weekly menu keys:", Object.keys(weeklyMenu));

            // Find the popup inside the selected restaurant card
            const restaurantCard = event.target.closest(".restaurant-card");
            const menuPopup = restaurantCard.querySelector(".menu-popup");

            // Clear the previous menu
            menuPopup.innerHTML = "";

            // Check if the API returned a valid weekly menu
            if (Array.isArray(weeklyMenu.days) && weeklyMenu.days.length > 0) {
              // Display each day of the week
              weeklyMenu.days.forEach((day) => {
                //Display the day
                const heading = document.createElement("h4");
                heading.textContent = day.date;
                menuPopup.appendChild(heading);

                // Check is this day has any dishes
                if (!day.courses || day.courses.length === 0) {
                  const message = document.createElement("p");
                  message.textContent = "No menu available for this day.";
                  menuPopup.appendChild(message);
                  return;
                }

                // Display all the dishes
                day.courses.forEach((food) => {
                  const paragraph = document.createElement("p");

                  paragraph.textContent = `${food.name}
                ${food.price ? " - " + food.price : ""}
                ${food.diets ? " (" + food.diets + ")" : ""}`;

                  menuPopup.appendChild(paragraph);
                });
              });
            } else {
              menuPopup.textContent = "weekly menu is currently unavailable.";
            }

            // WEEKLY MENU - Show popup only if mouse is still inside the card
            if (restaurantCard.matches(":hover")) {
              menuPopup.style.display = "block";
            } else {
              menuPopup.style.display = "none";
            }
          });
      }
    });
  });

// REGISTRATION - Find the registration form
const registrationForm = document.getElementById("register-form");

// REGISTRATION - Read the information entered by the user
registrationForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document.getElementById("register-username").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  // REGISTRATION - Send user details to the metropolia API
  const response = await fetch(
    "https://media2.edu.metropolia.fi/restaurant/api/v1/users",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    },
  );

  const data = await response.json();
  // REGISTRATION - Check if API confirmed success
  const registrationSuccessful = response.ok;

  // REGISTRATION - Open Login after confirmed success
  if (registrationSuccessful) {
    alert("Registration complete! Please log in.");

    // Close Registration popup
    document.getElementById("register").style.display = "none";

    // Open login popup
    document.getElementById("login").style.display = "block";

    // Keep the dark background visible
    document.getElementById("modal-overlay").style.display = "block";

    // Fill in the registered username
    document.getElementById("login-username").style.display = username;
  }

  // REGISTRATION - Detect the server email authentication error
  const emailError =
    !registrationSuccessful &&
    data.message?.includes("535 Authentication failed");

  // REGISTRATION - Verify account after email server error
  if (emailError) {
    const checkResponse = await fetch(
      "https://media2.edu.metropolia.fi/restaurant/api/v1/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      },
    );

    const checkData = await checkResponse.json();

    console.log("Registration verification:", checkResponse.status);

    // REGISTRATION - Confirm the account was created
    if (checkResponse.ok && checkData.token) {
      alert("Registration complete! Please log in.");

      // Close Registration and open Login
      document.getElementById("register").style.display = "none";
      document.getElementById("login").style.display = "block";

      // Keep the dark background
      document.getElementById("modal-overlay").style.display = "block";

      // Automatically fill in the username
      document.getElementById("login-username").value = username;
      return;
    }
  }

  // REGISTRATION - Check whether the API accepted the account
  console.log("Registration status:", response.status);
  console.log("Registration message:", data.message);

  // REGISTRATION - Show an error only if account was not verified
  if (!response.ok && !(emailError && checkResponse?.ok && checkData?.token)) {
    alert("Registration failed: " + (data.message || "Please try again."));
  }
});

// LOGIN - Find the login form
const loginForm = document.getElementById("login-form");

// LOGIN - Detect when the user clicks Log in
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  // LOGIN - Read username and password from the form
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  // LOGIN - Send credentials to the Metropolia API
  try {
    const response = await fetch(
      "https://media2.edu.metropolia.fi/restaurant/api/v1/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      },
    );

    const data = await response.json();

    console.log("Login status:", response.status);
    console.log("Login message:", data.message);
    console.log("Token received:", Boolean(data.token));

    // LOGIN - Save the token only when login succeeds
    if (response.ok && data.token) {
      sessionStorage.setItem("token", data.token);
      console.log("Login token saved!");

      // LOGIN - Save username for displaying after page refresh
      sessionStorage.setItem("username", data.data.username);

      // LOGIN - Display a welocome message
      const welcomeMessage = document.getElementById("welcome-message");

      welcomeMessage.textContent = `Welcome, ${data.data.username}!`;
      // LOGIN - replace header Login text with username
      document.getElementById("login-link").textContent = data.data.username;

      // LOGIN - Hide the login form after successful login
      document.getElementById("login").style.display = "none";
      // LOGIN - Remove the dark background after successful login
      document.getElementById("modal-overlay").style.display = "none";
    }
  } catch (error) {
    console.error("Login request failed:", error.message);
  }

  console.log("Login form submitted!");
});

// LOGIN POPUP - Open when header Login link is clicked
const loginLink = document.getElementById("login-link");

loginLink.addEventListener("click", (event) => {
  event.preventDefault();

  // LOGIN - Donot open Login popup if already logged in
  // ACCOUNT MENU - Toggle dropdown when username is clicked
  if (sessionStorage.getItem("token")) {
    const accountMenu = document.getElementById("account-menu");

    if (accountMenu.style.display === "block") {
      accountMenu.style.display = "none";
    } else {
      accountMenu.style.display = "block";
    }

    return;
  }

  // LOGIN - CLear previous enteries
  document.getElementById("login-form").reset();
  // SHOW dark background
  document.getElementById("modal-overlay").style.display = "block";

  // Show the login popup
  document.getElementById("login").style.display = "block";
});

// LOGIN POPUP - CLose when X is clicked
const closeLogin = document.getElementById("close-login");

closeLogin.addEventListener("click", () => {
  // Hide the Login popup
  document.getElementById("login").style.display = "none";

  // Hide the dark background
  document.getElementById("modal-overlay").style.display = "none";
});

// REGISTRATION POPUP - Open from Login
const registerLink = document.querySelector('a[href="#register"]');

registerLink.addEventListener("click", (event) => {
  event.preventDefault();

  // REGISTRATION - Clear previous fom enteries
  document.getElementById("register-form").reset();

  // Hide Login and show Registration
  document.getElementById("login").style.display = "none";
  document.getElementById("register").style.display = "block";
});

// LOGIN POPUP - CLose when X is clicked
const closeRegister = document.getElementById("close-register");

closeRegister.addEventListener("click", () => {
  // Hide the Registration popup
  document.getElementById("register").style.display = "none";

  // Hide the dark background
  document.getElementById("modal-overlay").style.display = "none";
});

// LOGOUT - Find the Logout link
const logoutLink = document.getElementById("logout-link");

// LOGOUT - clear login info
logoutLink.addEventListener("click", (event) => {
  event.preventDefault();

  // Remove the saved authentication token
  sessionStorage.removeItem("token");
  // LOGOUT - remove the save username
  sessionStorage.removeItem("username");

  // Restore the Login text in the header
  document.getElementById("login-link").textContent = "Log in";

  // Hide Logout
  logoutLink.style.display = "none";

  // Clear the welcome message
  document.getElementById("welcome-message").textContent = "";
});

// LOGIN - Restore username after refreshing the page
const savedToken = sessionStorage.getItem("token");
const savedUsername = sessionStorage.getItem("username");

if (savedToken && savedUsername) {
  document.getElementById("login-link").textContent = savedUsername;
}

// ACCOUNT MENU - Close dropdown when clocking outside
document.addEventListener("click", (event) => {
  const accountMenu = document.getElementById("account-menu");
  const loginLink = document.getElementById("login-link");

  // Check whether the click was outside the menu and username
  if (
    !accountMenu.contains(event.target) &&
    !loginLink.contains(event.target)
  ) {
    accountMenu.style.display = "none";
  }
});
