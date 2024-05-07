const SignInForm = (function () {
  // This function initializes the UI
  const initialize = function () {
    // Initialize the UI
    $("#register-form-page").hide();
    $("#gameover-overlay").hide();

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
    const currentUser = Authentication.getUser();

    for (const username in users) {
      if (username !== currentUser.username) {
        const userElement = $(
          `<button class="online-player-button" role="button">${username}</button>`
        );
        $("#player-list").append(userElement);
      }
    }
    listenForChallenges();
  };

  const listenForChallenges = () => {
    $(".online-player-button").on("click", function () {
      const player = Authentication.getUser().username;
      const opponent = $(this).text();
      Socket.sendChallenge(player, opponent);
      PlayerPanel.hide();
      WaitingForOpponentModal.createModal(opponent);
    });
  };

  const removeUser = function (user) {
    const onlinePlayersArea = $("#player-list");
    onlinePlayersArea.find(`button:contains(${user.username})`).remove();
  };

  return { initialize, update, removeUser };
})();

const AcceptChallengeModal = (function () {
  const initialize = function () {
    $("#accept-challenge-overlay").hide();
  };

  const createModal = function (pairing) {
    PlayerPanel.hide();
    $("#accept-challenge-overlay").show();
    const text = `<p>You have been challenged by ${pairing.player}</p>
    <p>Do you accept the challenge?</p>`;
    $("#accept-challenge-text").append(text);

    $("#accept-challenge-button").on("click", () => {
      Socket.acceptChallenge(pairing);
    });

    $("#reject-challenge-button").on("click", () => {
      Socket.rejectChallenge(pairing);
    });
  };

  const hide = function () {
    $("#accept-challenge-overlay").hide();
    $("#accept-challenge-text").empty();
  };

  return { initialize, createModal, hide };
})();

const WaitingForOpponentModal = (function () {
  const initialize = function () {
    $("#waiting-for-opponent-overlay").hide();
  };

  const createModal = function (opponent) {
    $("#waiting-for-opponent-overlay").show();
    const text = `<p>Waiting for ${opponent} to accept the challenge...</p>`;
    $("#waiting-for-opponent-text").append(text);
  };

  const hide = function () {
    $("#waiting-for-opponent-overlay").hide();
    $("#waiting-for-opponent-text").empty();
  };

  return { initialize, createModal, hide };
})();

const CountDown = (function () {
  const initialize = function () {
    $("#countdown-overlay").hide();
  };

  const start = function (pairing) {
    $("#countdown-overlay").show();
    let count = 5;
    $("#countdown-text").empty();
    const text = `The game will start in ${count} seconds.`;
    $("#countdown-text").append(text);

    const interval = setInterval(() => {
      count--;
      $("#countdown-text").empty();
      const text = `The game will start in ${count} seconds. `;
      $("#countdown-text").append(text);
      if (count === 0) {
        clearInterval(interval);
        $("#countdown-overlay").hide();
        Game.start(pairing);
      }
    }, 1000);
  };

  const reject = function (pairing) {
    $("#countdown-overlay").show();
    let count = 2;
    let text = "";
    $("#countdown-text").empty();
    if (Authentication.getUser().username === pairing.player) {
      text = `<p> Your challenge to ${pairing.opponent} was rejected. </p> <p> Returning to the player panel... </p>`;
      $("#countdown-text").append(text);
    } else {
      text = `You rejected the challenge from ${pairing.player}. <p> Returning to the player panel...</p>`;
      $("#countdown-text").append(text);
    }

    const interval = setInterval(() => {
      count--;
      if (count === 0) {
        clearInterval(interval);
        $("#countdown-overlay").hide();
        PlayerPanel.show();
      }
    }, 1000);
  };

  return { initialize, start, reject };
})();

const UI = (function () {
  // The components of the UI are put here
  const components = [
    SignInForm,
    PlayerPanel,
    OnlinePlayersArea,
    AcceptChallengeModal,
    WaitingForOpponentModal,
    CountDown,
  ];

  // This function initializes the UI
  const initialize = () => {
    // Initialize the components
    for (const component of components) {
      component.initialize();
    }
  };

  return { initialize };
})();
