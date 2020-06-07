import fetch from "./apiAxios";

export default function () {
  let greet = document.createElement("div");
  greet.textContent = "Hi there and greetings!";
  greet.onclick = function () {
    console.log("click");
    fetch("XXX", { name: "raven", age: "25" });
  };
  return greet;
}
