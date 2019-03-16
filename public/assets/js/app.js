$(document).ready(function () {
  $(".save-btn").on("click", function (event) {
    var newSavedArticle = $(this).data();
    newSavedArticle.saved = true;
    console.log("saved was clicked");
    var id = $(this).attr("data-articleid");
    $.ajax("/saved/" + id, {
      type: "PUT",
      data: newSavedArticle
    }).then(
      function (data) {
        location.reload();
      }
    );
  });

  // Get new articles
  $(".scrape-new").on("click", function (event) {
    event.preventDefault();
    $.get("/scrape", function (data) {
      window.location.reload();
    });
  });

  // Deletes articles.
  $(".unsave-btn").on("click", function(event) {
    var newUnsavedArticle = $(this).data();
    var id = $(this).attr("data-articleid");
    newUnsavedArticle.saved = false;
    $.ajax("/saved/" + id, {
      type: "PUT",
      data: newUnsavedArticle
    }).then(
      function(data) {
        location.reload();
      }
    );
  });

  // Post new note modals
  function createModalHTML(data) {
    var modalText = data.title;
    $("#note-modal-title").text("Notes for article: " + data.title);
    var noteItem;
    var noteDeleteBtn;
    console.log("data notes legnth ", data.notes.length)
    for (var i = 0; i < data.notes.length; i++) {
      noteItem = $("<li>").text(data.notes[i].body);
      noteItem.addClass("note-item-list");
      noteItem.attr("id", data.notes[i]._id);
      noteDeleteBtn = $("<button> x </button>").addClass("btn btn-warning delete-note-modal");
      noteDeleteBtn.attr("data-noteId", data.notes[i]._id);
      noteItem.prepend(noteDeleteBtn, " ");
      $(".notes-list").append(noteItem);
    }
  }

  // Add note button is clicked --> Show modal
  $(".note-modal-btn").on("click", function (event) {
    var articleId = $(this).attr("data-articleId");
    $("#add-note-modal").attr("data-articleId", articleId);
    $("#note-modal-title").empty();
    $(".notes-list").empty();
    $("#note-body").val("");
    $.ajax("/notes/article/" + articleId, {
      type: "GET"
    }).then(
      function (data) {
        createModalHTML(data);
      }
    );

    // Show the modal
    $("#add-note-modal").modal("toggle");
  });

  // Save Note
  $(".note-save-btn").on("click", function (event) {
    event.preventDefault();
    var articleId = $("#add-note-modal").attr("data-articleId")
    var newNote = {
      body: $("#note-body").val().trim()
    }
    console.log(newNote);
    $.ajax("/submit/" + articleId, {
      type: "POST",
      data: newNote
    }).then(
      function (data) { }
    );
  });

  // Delete the note.
  $(document).on("click", ".delete-note-modal", function (event) {
    var noteID = $(this).attr("data-noteId");

    $.ajax("/notes/" + noteID, {
      type: "GET"
    }).then(
      function (data) {
        $("#" + noteID).remove();
      })
  });

});