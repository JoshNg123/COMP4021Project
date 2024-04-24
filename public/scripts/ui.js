const SignInForm = (function () {
  // This function initializes the UI
  const initialize = function () {
    // Initialize the UI
    $("#register-form-page").hide();

    $("#register-button-0").on("click", (e) => {
      e.preventDefault();
      $("#signin-form-page").hide();
      $("#register-form-page").show();
    });

    $("#register-button-1").on("click", (e) => {
      e.preventDefault();
      const username = $("#register-username").val().trim();
      const password1 = $("#register-password").val().trim();
      const password2 = $("#register-password2").val().trim();
      //   Maybe Check for username here
      if (password1 != password2) {
        $("#register-message").text("Passwords do not match.");
        return;
      }

      Registration.register(
        username,
        password1,
        () => {
          $("#register-form").get(0).reset();
          $("#register-message").text("You can sign in now.");
        },
        (error) => {
          $("#register-message").text(error);
        }
      );
    });

    $("#back-button").on("click", (e) => {
      e.preventDefault();
      $("#register-form-page").hide();
      $("#signin-form-page").show();
    });

    // Submit event for the signin form
    $("#battle-button").on("click", (e) => {
      // Do not submit the form
      e.preventDefault();

      // Get the input fields
      const username = $("#signin-username").val().trim();
      const password = $("#signin-password").val().trim();

      console.log(username, password);

      // Send a signin request
      Authentication.signin(
        username,
        password,
        () => {
          $("#signin-form").get(0).reset();
          $("#signin-overlay").hide();
          PlayerPanel.update(Authentication.getUser());
          PlayerPanel.show();
          Socket.connect();
        },
        (error) => {
          $("#signin-message").text(error);
        }
      );
    });
  };

  // This function hides the form
  const hide = function () {
    $("#signin-overlay").hide();
  };

  const show = function () {
    $("#signin-overlay").show();
  };

  return { initialize, hide, show };
})();

const PlayerPanel = (function () {
  // This function initializes the UI
  const initialize = function () {
    // Initialize the UI
    $("#player-match-overlay").hide();

    $("#match-back-button").on("click", () => {
      Authentication.signout(
        () => {
          Socket.disconnect();
          $("#player-match-overlay").hide();
          SignInForm.show();
        },
        (error) => {
          console.log(error);
        }
      );
    });
  };

  const show = function () {
    $("#player-match-overlay").show();
  };

  const update = function (user) {
    const username = user.username;
    const welcomeMessage = `Welcome to the Battlefield, ${username}`;
    $("#welcome-message").append(welcomeMessage);
  };

  const hide = function () {
    $("#player-match-overlay").hide();
  };

  return { initialize, show, update, hide };
})();

const OnlinePlayersArea = (function () {
  // This function initializes the UI
  const initialize = function () {
    // Initialize the UI
  };

  const update = function (users) {
    $("#player-list").empty();
    const currentUser = Authentication.getUser();

    for (const username in users) {
      if (username !== currentUser.username) {
        const userElement = $(
          `<button class="online-player-button" role="button">${username}</button>`
        );
        $("#player-list").append(userElement);
      }
    }
  };

  // const addUser = function (user) {
  //   console.log("Adding User");
  //   console.log(user);
  //   const onlinePlayersArea = $("#player-list");
  //   const userElement = $(`<div>${user.username}</div>`);
  //   console.log(userElement);
  //   onlinePlayersArea.append(userElement); // Use append() instead of text()
  //   console.log("Adding User");
  //   $("#player-list").append(`<p>${user.username}</p>`);
  // };

  const removeUser = function (user) {
    console.log(user);
    const onlinePlayersArea = $("#player-list");
    onlinePlayersArea.find(`button:contains(${user.username})`).remove();
  };

  return { initialize, update, removeUser };
})();

const UI = (function () {
  // The components of the UI are put here
  const components = [SignInForm, PlayerPanel, OnlinePlayersArea];

  // This function initializes the UI
  const initialize = () => {
    // Initialize the components
    for (const component of components) {
      component.initialize();
    }
  };

  return { initialize };
})();
