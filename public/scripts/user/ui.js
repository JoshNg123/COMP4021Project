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
          $("#welcome-message").empty();
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
      turnOffEventListeners();
    });

    $("#reject-challenge-button").on("click", () => {
      Socket.rejectChallenge(pairing);
      turnOffEventListeners();
    });
  };

  const hide = function () {
    $("#accept-challenge-overlay").hide();
    $("#accept-challenge-text").empty();
  };

  const turnOffEventListeners = function () {
    $("#accept-challenge-button").off("click");
    $("#reject-challenge-button").off("click");
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

const GameOver = (function () {
  const initialize = function () {
    $("#gameover-overlay").hide();

    $("#sign-out-button").on("click", () => {
      Authentication.signout(
        () => {
          $("#welcome-message").empty();
          $("#leaderboard-list").empty();
          $(".leaderboard").empty();
          $(".leaderboard").hide();
          hide();
          SignInForm.show();
          Socket.disconnect();
        },
        (error) => {
          console.log(error);
        }
      );
    });

    $("#replay-button").on("click", () => {
      Socket.returnToPlayerArea(Authentication.getUser().username);
      $("#leaderboard-list").empty();
      hide();
      PlayerPanel.show();
    });
  };

  const showGameOver = async function (
    opponent,
    player,
    player1,
    player2,
    player1BombCount,
    player2BombCount
  ) {
    if (player1.get_life() > player2.get_life()) {
      $("#winner").text(opponent);
      const msg = "Battled with: " + player;
      $("#loser").text(msg);
      if (Authentication.getUser().username == opponent) {
        const updateOpponentResult = await fetch("/updateVictory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ winner: opponent }),
        });
        const updateOpponentresponse = await updateOpponentResult.json();
      }
    } else if (player1.get_life() < player2.get_life()) {
      $("#winner").text(player);
      const msg = "Battled with: " + opponent;
      $("#loser").text(msg);
      if (Authentication.getUser().username == player) {
        const updatePlayerResult = await fetch("/updateVictory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ winner: player }),
        });
        const updatePlayerresponse = await updatePlayerResult.json();
      }
    } else {
      $("#winner").text("Tie");
      $("#loser").text("Nice Game!");
    }

    let statstext1 = opponent + " shot " + player1BombCount + " times!";
    $("#stats1").text(statstext1);
    let statstext2 = player + " shot " + player2BombCount + " times!";
    $("#stats2").text(statstext2);

    let users;
    try {
      const result = await fetch("/getusers", {
        method: "GET",
      });
      const response = await result.json();

      if (response.status === "success") {
        users = response.users;
      } else if (response.status === "error") {
        if (onError) {
          onError(response.error);
        }
      }
      $("#gameover-overlay").show();

      // Convert the users object keys into an array
      const userKeys = Object.keys(users);

      // Sort the user keys based on the corresponding victory counts in descending order
      userKeys.sort((a, b) => users[b].victories - users[a].victories);

      // Get the leaderboard list element
      const leaderboardList = document.getElementById("leaderboard-list");

      // Define the limit for the number of players to display
      const limit = 3;

      // Iterate over the sorted user keys array up to the defined limit
      for (let i = 0; i < Math.min(limit, userKeys.length); i++) {
        const userKey = userKeys[i];
        const user = users[userKey];

        const listItem = document.createElement("li");

        const playerName = document.createElement("span");
        playerName.className = "player-name";
        playerName.textContent = userKey;

        const playerScore = document.createElement("span");
        playerScore.className = "player-score";
        playerScore.textContent = user.victories;

        listItem.appendChild(playerName);
        listItem.appendChild(playerScore);

        leaderboardList.appendChild(listItem);
      }
    } catch (error) {
      console.log("Error retrieving data:", error);
    }
  };

  const hide = function () {
    $("#gameover-overlay").hide();
  };

  return { showGameOver, hide, initialize };
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
    GameOver,
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
