const Registration = (function () {
  const register = async function (username, password, onSuccess, onError) {
    const input = { username, password };
    const data = JSON.stringify(input);

    try {
      const result = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data,
      });
      const response = await result.json();
      if (response.status === "success") {
        if (onSuccess) {
          onSuccess();
        }
      } else if (response.status === "error") {
        if (onError) {
          onError(response.error);
        }
      }
    } catch (error) {
      console.log("Error");
    }
  };

  return { register };
})();
