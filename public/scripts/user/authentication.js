const Authentication = (function () {
  // This stores the current signed-in user
  let user = null;

  // This function gets the signed-in user
  const getUser = function () {
    return user;
  };

  // This function sends a sign-in request to the server
  // * `username`  - The username for the sign-in
  // * `password`  - The password of the user
  // * `onSuccess` - This is a callback function to be called when the
  //                 request is successful in this form `onSuccess()`
  // * `onError`   - This is a callback function to be called when the
  //                 request fails in this form `onError(error)`
  const signin = async function (username, password, onSuccess, onError) {
    const input = { username, password };
    const data = JSON.stringify(input);

    try {
      result = await fetch("/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data,
      });
      response = await result.json();
      if (response.status === "success") {
        user = response.user;
        if (onSuccess) {
          onSuccess();
        }
      } else if (response.status === "error") {
        if (onError) {
          onError(response.error);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // This function sends a validate request to the server
  // * `onSuccess` - This is a callback function to be called when the
  //                 request is successful in this form `onSuccess()`
  // * `onError`   - This is a callback function to be called when the
  //                 request fails in this form `onError(error)`
  const validate = async function (onSuccess, onError) {
    try {
      result = await fetch("/validate", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      response = await result.json();
      if (response.status === "error") {
        if (onError) {
          onError(response.error);
        }
      }
      if (response.status === "success") {
        user = response.user;
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // This function sends a sign-out request to the server
  // * `onSuccess` - This is a callback function to be called when the
  //                 request is successful in this form `onSuccess()`
  // * `onError`   - This is a callback function to be called when the
  //                 request fails in this form `onError(error)`
  const signout = async function (onSuccess, onError) {
    try {
      result = await fetch("/signout", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      response = await result.json();
      if (response.status === "success") {
        if (onSuccess) {
          onSuccess();
          user = null;
        }
      } else if (response.status === "error") {

        if (onError) {
          onError(response.error);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return { getUser, signin, validate, signout };
})();
