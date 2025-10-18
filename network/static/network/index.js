let pageNo = 1;
let postingCount = 0;
let noOfPostPerPage = 10;

document.addEventListener("DOMContentLoaded", function () {
  var url = window.location.href;
  url = url.split("/");
  var loginUser = document.querySelector("#loginUser").innerHTML;

  //only adds event listener once the user login.
  if (loginUser !== "None" && url[3] === "") {
    //creates event listener to textarea when there's an input
    document.querySelector("#addNewPost").addEventListener("keyup", () => {
      var noOfText = document.querySelector("#addNewPost").value;

      // if the textarea has value, Post butto will be active,
      // if not, remain inactive
      if (noOfText.length > 0) {
        document.querySelector("#submit").removeAttribute("disabled");
        document.querySelector("#submit").removeAttribute("class");
      } else {
        document.querySelector("#submit").setAttribute("disabled", "");
        document.querySelector("#submit").setAttribute("class", "disabled");
      }
    });
  }
  display_post(pageNo);
});

/*
/ Function that let the user add post
*/
function addPost() {
  let body = document.querySelector("#addNewPost").value;

  let posts = new Object();
  posts.body = body;

  fetch("/posts", {
    method: "POST",
    body: JSON.stringify(posts),
  })
    .then((response) => response.json())
    .then((result) => {
      document.querySelector("#addNewPost").value = "";
      document.querySelector("#postingCount").innerHTML = result.noOfPost;
      postingCount = result.noOfPost;
      document.querySelector("#submit").setAttribute("disabled", "");
      document.querySelector("#submit").setAttribute("class", "disabled");
      page(pageNo);
    });
}
/*
/ Function that display all posts
*/
function display_post(pageNo) {
  var url = window.location.href;
  var action;
  var profilePath;
  url = url.split("/");
  const allPostsDiv = document.querySelector("#allPosts");

  //if url is not blank, the url is from profile
  //if the user is in the login or register screen, it will skip the below processes
  //if not, the it is in the index
  if (url[4] !== undefined) {
    action = url[4];
  } else if (url[3] === "login" || url[3] === "register") {
    return 0;
  } else {
    action = "allposts";
  }

  // if url is not blank, the url is from profile
  // if not, then it is in index and needs to link the profile
  if (url[3] !== "") {
    profilePath = "";
  } else {
    profilePath = "profile/";
  }

  fetch(`/posts/${action}/page=${pageNo}`)
    .then((response) => response.json())
    .then((postsDisplay) => {
      //Displays pagination or not
      postingCount = document.querySelector("#postingCount").innerHTML;

      if (
        postingCount != null &&
        postsDisplay.length != undefined &&
        postsDisplay.length > 0
      ) {
        document.getElementsByClassName("pagination")[0].style.visibility =
          "visible";
      } else if (postingCount != null) {
        document.getElementsByClassName("pagination")[0].style.visibility =
          "hidden";
      }

      //clear all items
      allPostsDiv.innerHTML = "";

      //last page checker
      lastPage = postingCount / noOfPostPerPage;

      if (Math.ceil(lastPage) == pageNo) {
        document.querySelector("#next").classList.add("disabled");
        document.querySelector("#next").hidden = true;
      }

      let elements = document.querySelectorAll(".pagination > li");

      //when page loaded..
      //page 3 disabling when the number of post is less than 30
      if (Math.ceil(lastPage) < 3) {
        elements[3].classList.add("disabled");
        elements[3].hidden = true;
      }
      //page 2 disabling when the number of post is less than 20
      if (Math.ceil(lastPage) < 2) {
        elements[2].classList.add("disabled");
        elements[2].hidden = true;
      }

      postsDisplay.forEach((element) => {
        const div = document.createElement("div");
        const divLabel = document.createElement("div");
        const divLine = document.createElement("div");

        div.setAttribute("id", "posts");
        divLabel.setAttribute("id", `content-${element.id}`);
        divLine.setAttribute("class", "line");
        const h4 = document.createElement("h4");
        const a = document.createElement("a");
        const p1 = document.createElement("label");
        const p2 = document.createElement("p");
        const likers = document.createElement("label");
        const likersText = document.createElement("span");
        const like = document.createElement("span");

        const aEdit = document.createElement("label");
        var loginUser = parseInt(
          document.querySelector("#loginUser").innerHTML
        );
        likers.setAttribute("id", `like-${element.id}`);

        //display icon liked when the user likes the post
        if (element.likers.indexOf(loginUser) > -1) {
          like.innerHTML = "&#9829;";
          like.setAttribute("class", `like`);
          like.setAttribute("onclick", `unlike(${element.id})`);

          //display icon to unliked when the user didn't like the post
        } else {
          like.innerHTML = "&#9825;";
          like.setAttribute("class", `like`);
          like.setAttribute("onclick", `like(${element.id})`);
        }

        let likeText = "likes";
        if (element.likers.length < 2) {
          likeText = "like";
        }

        likersText.innerHTML = `&nbsp;&nbsp;${element.likers.length} &nbsp;&nbsp;${likeText}`;
        likersText.setAttribute(
          "style",
          "position:absolute; padding-top:10px;"
        );
        like.setAttribute("style", "font-size:28px;");

        p1.setAttribute("id", `date-${element.id}`);
        p1.setAttribute("class", "date");
        p2.setAttribute("id", `post-content-${element.id}`);

        //if the post is posted by login user, it will allow to edit the post
        if (loginUser != "None" && loginUser == element.postUserId) {
          aEdit.setAttribute("onclick", `edit(${element.id})`);
          aEdit.setAttribute("class", "edit");
          aEdit.setAttribute("id", `edit-${element.id}`);
          aEdit.innerHTML = "Edit";
        }

        a.setAttribute("href", `${profilePath}${element.postUserId}`);
        a.innerHTML = element.postUser;
        h4.append(a);
        p1.innerHTML = element.date + "&nbsp";
        p2.innerHTML = element.postDescription.replaceAll("\n", "<br>");
        likers.append(like);
        likers.append("");
        likers.append(likersText);
        divLabel.append(p2);
        div.append(h4);
        div.append(p1);
        div.append(aEdit);
        div.append(divLabel);
        div.append(divLine);
        div.append(likers);

        allPostsDiv.append(div);
      });
    });
}
/*
/ Function that process the logic of pagination
*/
function page(value) {
  let elements = document.querySelectorAll(".pagination > li");
  currentPage = pageNo;

  //when the user clicked next button, page number will increment
  //when the user clicked previous button, page number will decrement
  //else once user clicked the page number
  if (value === "Next") {
    pageNo += 1;
  } else if (value === "Previous") {
    pageNo -= 1;
  } else {
    pageNo = parseInt(value);
  }

  //disabling previous button
  if (pageNo > 1) {
    document.querySelector("#previous").classList.remove("disabled");
    document.querySelector("#previous").hidden = false;
  } else {
    document.querySelector("#previous").classList.add("disabled");
    document.querySelector("#previous").hidden = true;
  }

  lastPage = postingCount / noOfPostPerPage;

  //page number active
  if (
    pageNo > 1 || // true when current page is page 2 or above and user keeps on posting and it reaches the limit of each page 10, it will recreate the buttons
    (value == 2 && currentPage == 3) || // true when current page is page 3 and clicked page 2, it will recreate the buttons
    (value === "Previous" && pageNo == 2)
  ) {
    // true when Previous button is clicked while on page 2, it will recreate the buttons
    let parent = document.querySelector(".pagination");
    elements[4].remove();
    elements[3].remove();
    elements[2].remove();
    elements[1].remove();

    const firstLiElem = document.createElement("li");
    firstLiElem.setAttribute("class", "page-item");
    const firstElem = document.createElement("input");
    firstElem.setAttribute("type", "button");
    firstElem.setAttribute("class", "page-link");
    firstElem.setAttribute("onclick", "page(this.value)");
    firstElem.setAttribute("value", pageNo - 1);
    firstLiElem.append(firstElem);
    parent.append(firstLiElem);

    const secLiElem = document.createElement("li");
    secLiElem.setAttribute("class", "page-item active");
    const secElem = document.createElement("input");
    secElem.setAttribute("type", "button");
    secElem.setAttribute("class", "page-link");
    secElem.setAttribute("onclick", "page(this.value)");
    secElem.setAttribute("value", pageNo);
    secLiElem.append(secElem);
    parent.append(secLiElem);

    const thirdLiElem = document.createElement("li");
    thirdLiElem.setAttribute("class", "page-item");
    if (Math.ceil(lastPage) == pageNo) {
      // if the user is in the page where the displayed number of post is not exceeds to 10, the 3rd button should not display
      thirdLiElem.setAttribute("class", "page-item disabled");
      thirdLiElem.hidden = true;
    }
    const thirdElem = document.createElement("input");
    thirdElem.setAttribute("type", "button");
    thirdElem.setAttribute("class", "page-link");
    thirdElem.setAttribute("onclick", "page(this.value)");
    thirdElem.setAttribute("value", pageNo + 1);
    thirdLiElem.append(thirdElem);
    parent.append(thirdLiElem);

    const nextLiElem = document.createElement("li");
    nextLiElem.setAttribute("class", "page-item");
    nextLiElem.setAttribute("id", "next");
    const nextElem = document.createElement("input");
    nextElem.setAttribute("type", "button");
    nextElem.setAttribute("class", "page-link");
    nextElem.setAttribute("onclick", "page(this.value)");
    nextElem.setAttribute("value", "Next");
    nextLiElem.append(nextElem);
    parent.append(nextLiElem);
  } else if (value === "Next") {
    elements[pageNo - 1].classList.remove("active");
    elements[pageNo].classList.add("active");
  }

  //button previous clicks and going to page 1,
  //removing the active in page 2
  if (value === "Previous" && pageNo == 1) {
    elements[2].classList.remove("active");
    elements[1].classList.add("active");
  }

  //if the page 2 button clicks and the current page is 1,
  // then it will remove the active in page 1
  if (value == 2 && currentPage == 1) {
    elements[1].classList.remove("active");
    elements[2].classList.add("active");

    //else if page 1 button is click,
    //it will remove the active in page 2
  } else if (value == 1) {
    elements[2].classList.remove("active");
    elements[1].classList.add("active");
  }

  //While in the page 1 and user keep on posting, it should display either page 2 when post exceeds to 20 and page 3 when post exceeds to 30
  if (pageNo == 1 && Math.ceil(lastPage) == 2) {
    elements[2].classList.remove("disabled");
    elements[2].hidden = false;
  } else if (pageNo == 1 && Math.ceil(lastPage) == 3) {
    elements[3].classList.remove("disabled");
    elements[3].hidden = false;
  }

  //if it reaches the last page number,
  //the next button will disabled
  if (Math.ceil(lastPage) == pageNo || Math.ceil(lastPage) < pageNo) {
    document.querySelector("#next").classList.add("disabled");
    document.querySelector("#next").hidden = true;
  } else {
    document.querySelector("#next").classList.remove("disabled");
    document.querySelector("#next").hidden = false;
  }

  display_post(pageNo);
}
/*
/ Function that let the user unfollow a user
*/
function unfollow() {
  let following = document.getElementById("following");
  let dataset = following.getAttribute("data-id");

  fetch(`unfollow/${dataset}`)
    .then((response) => response.json())
    .then((follow) => {
      document.querySelector(".followersCount").innerHTML = follow.followers;
      document.querySelector(".buttonFollow").innerHTML = "";
      const buttonFollow = document.createElement("button");
      buttonFollow.setAttribute("class", "btn btn-info");
      buttonFollow.setAttribute("data-id", dataset);
      buttonFollow.setAttribute("id", "follow");
      buttonFollow.setAttribute("onclick", "follow()");
      buttonFollow.innerHTML = "Follow";
      document.querySelector(".buttonFollow").append(buttonFollow);
    });
}
/*
/ Function that let the user follow a user
*/
function follow() {
  let follow = document.getElementById("follow");
  let dataset = follow.getAttribute("data-id");

  fetch(`follow/${dataset}`)
    .then((response) => response.json())
    .then((following) => {
      document.querySelector(".followersCount").innerHTML = following.followers;
      document.querySelector(".buttonFollow").innerHTML = "";
      const buttonFollow = document.createElement("button");
      buttonFollow.setAttribute("class", "btn btn-info");
      buttonFollow.setAttribute("data-id", dataset);
      buttonFollow.setAttribute("id", "following");
      buttonFollow.setAttribute("onclick", "unfollow()");
      buttonFollow.innerHTML = "Unfollow";
      document.querySelector(".buttonFollow").append(buttonFollow);
    });
}
/*
/ Function that changes the edit link to submit onced clicked
*/
function edit(postNo) {
  const content = document.querySelector(`#post-content-${postNo}`).innerHTML;
  let post = document.querySelector(`#content-${postNo}`);
  document.querySelector(`#post-content-${postNo}`).remove();
  document.querySelector(`#edit-${postNo}`).innerHTML = "Submit";
  document
    .querySelector(`#edit-${postNo}`)
    .setAttribute("onclick", `submit(${postNo})`);

  let textarea = document.createElement("textarea");
  textarea.setAttribute("id", `editPost-${postNo}`);
  textarea.setAttribute("name", `editPost-${postNo}`);
  textarea.setAttribute("rows", "4");
  textarea.setAttribute("cols", "110");
  textarea.innerHTML = content.replaceAll("<br>", "\n");

  post.append(textarea);
}
/*
/ Function that changes the submit link to edit onced clicked
/ and submit the edited post
*/
function submit(postNo) {
  document.querySelector(`#edit-${postNo}`).innerHTML = "Edit";
  document
    .querySelector(`#edit-${postNo}`)
    .setAttribute("onclick", `edit(${postNo})`);

  let post = document.querySelector(`#content-${postNo}`);
  let postContent = document.querySelector(`#editPost-${postNo}`).value;

  fetch(`/post/edit/${postNo}`, {
    method: "POST",
    body: JSON.stringify(postContent),
  })
    .then((response) => response.json())
    .then((result) => {
      document.querySelector(`#editPost-${postNo}`).remove();
      let postLabel = document.createElement("label");
      postLabel.setAttribute("id", `post-content-${postNo}`);
      postLabel.innerHTML = postContent.replaceAll("\n", "<br>");

      post.append(postLabel);
    });
}
/*
/ Function that changes the liked button to unliked
/ and submit to unliked post
*/
function unlike(postNo) {
  fetch(`/post/unlike/${postNo}`)
    .then((response) => response.json())
    .then((result) => {
      const likersText = document.createElement("span");
      const like = document.createElement("span");
      const label = document.querySelector(`#like-${postNo}`);
      label.innerHTML = "";
      var loginUser = parseInt(document.querySelector("#loginUser").innerHTML);

      if (result.likes.indexOf(loginUser) > -1) {
        like.innerHTML = "&#9829;";
        like.setAttribute("class", `like`);
        like.setAttribute("onclick", `unlike(${postNo})`);
      } else {
        like.innerHTML = "&#9825;";
        like.setAttribute("class", `like`);
        like.setAttribute("onclick", `like(${postNo})`);
      }
      let likeText = "likes";
      if (result.likes.length < 2) {
        likeText = "like";
      }

      likersText.innerHTML = `&nbsp;&nbsp;${result.likes.length} &nbsp;&nbsp;${likeText}`;
      likersText.setAttribute("style", "position:absolute; padding-top:10px;");
      like.setAttribute("style", "font-size:28px;");
      label.append(like);
      label.append(likersText);
    });
}
/*
/ Function that changes the unliked button to liked
/ and submit to liked post
*/
function like(postNo) {
  fetch(`/post/like/${postNo}`)
    .then((response) => response.json())
    .then((result) => {
      const likersText = document.createElement("span");
      const like = document.createElement("span");
      const label = document.querySelector(`#like-${postNo}`);
      label.innerHTML = "";
      var loginUser = parseInt(document.querySelector("#loginUser").innerHTML);

      if (result.likes.indexOf(loginUser) > -1) {
        like.innerHTML = "&#9829;";
        like.setAttribute("class", `like`);
        like.setAttribute("onclick", `unlike(${postNo})`);
      } else {
        like.innerHTML = "&#9825;";
        like.setAttribute("class", `like`);
        like.setAttribute("onclick", `like(${postNo})`);
      }
      let likeText = "likes";
      if (result.likes.length < 2) {
        likeText = "like";
      }

      likersText.innerHTML = `&nbsp;&nbsp;${result.likes.length} &nbsp;&nbsp;${likeText}`;
      likersText.setAttribute("style", "position:absolute; padding-top:10px;");
      like.setAttribute("style", "font-size:28px;");
      label.append(like);
      label.append(likersText);
    })
    // when user tries to like the post but he/she is not logined, throw to login page
    .catch((error) => {
      window.location.href = "/login";
    });
}
