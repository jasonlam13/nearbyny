var app = {
   PARSE_APP : "bFpMdQLKzOXnYH7r9wdRRME4JmsZ4oxSae2YrH84",
   PARSE_JS : "T5dQgHMRBck7xs3Dws2tmhJylLabXaOzebAfVTsg",
   Event: null,
   EventList: null,

    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        this.onDeviceReady();
        $(".button-collapse").sideNav();
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        this.initParse();
        this.signinPage.setupSignin();
        this.signupPage.setupSignup();
        this.trendingPage.setupTrending();
        this.setupLinks();
        login.initialize();
        //trending.initialize();
        this.setupLinks();
        
        if (Parse.User.current()) {
            document.getElementById("view-trending").style.display = "inline";
        } else{
            document.getElementById("view-signin").style.display = "inline";
        }
    },

    initParse: function() {
        Parse.initialize(this.PARSE_APP, this.PARSE_JS);
        Event = Parse.Object.extend("Event");
        EventList = Parse.Collection.extend({
            model: Event
        });
    },
    setupLinks: function() {
      var buttons = document.querySelectorAll(".goto-trending , .goto-signup , .goto-map , .goto-signin , .goto-profile, .signout");
      for (var i = 0; i  < buttons.length; i++) {
        switch (buttons[i].getAttribute("class")) {
            case "goto-trending":
                $(buttons[i]).click( function() {
                    controller.changeViewTo("view-trending");
                });
                break;
            case "goto-signup":
                $(buttons[i]).click( function() {
                    controller.changeViewTo("view-signup");
                });
                break;
            case "goto-signin":
                $(buttons[i]).click( function() {
                    controller.changeViewTo("view-signin");
                });
                break;
            case "goto-map":
                $(buttons[i]).click( function() {
                    controller.changeViewTo("view-map");        
                    mapPage.initialize();
                });
            case "goto-profile":
                buttons[i].addEventListener("click", function(){
                    if (Parse.User.current()){
                        controller.changeViewTo("view-profile");
                        app.profilePage.setupProfilePage();
                    }                    
                });
                break;
            case "signout":
                buttons[i].addEventListener("click", function(){
                    Parse.User.logOut();
                    controller.changeViewTo("view-signin");
                    app.profilePage.setupProfilePage();                        
                });
                break;
            default:
                break;
        }
    }
},

    changeViewTo: function(viewId){
        for (var i = 0; i < viewframes.length; i++){
            viewframes[i].hide()
        }
        document.getElementById(viewId).style.display = "inline";
    },

    signupPage: {
     setupSignup: function(){
        var temp;
        temp = document.getElementById("signup-button");
        if (temp !== null){
          temp.addEventListener("click", function(e){
            var formName = document.getElementById("signup-username").value;
            var formPass = document.getElementById("signup-password").value;
            var formConfirmPass = document.getElementById("signup-confirm-password").value;
            var formEmail = document.getElementById("signup-email").value;
            if (formName !== "" && formEmail !== "" && formPass !== "" && formConfirmPass === formPass){

               e.preventDefault();
               Parse.User.signUp(formName, formPass, {},{
                success:function(result){
                    document.getElementById("signup-status").innerHTML = "Registration successful";
                },
                error:function(error){
                    console.dir(error);
                    document.getElementById("signup-status").innerHTML = "Username already taken<br>Try again";
                }
            });
           }else{
               document.getElementById("signup-status").innerHTML = "Form incorrectly filled";
           }
       });
}
}
},

signinPage: {
	setupSignin: function(){
        var temp = document.getElementById("signin-button");
        if (temp !== null){
          temp.addEventListener("click", function(e){
            var formName = document.getElementById("signin-username").value;
            var formPass = document.getElementById("signin-password").value;
            if (formName !== "" && formPass !== ""){
               e.preventDefault();
               Parse.User.logIn(formName, formPass, {
                success:function(result){
                    for (var x = 0; x < viewframes.length; x++){
                        //viewframes[x].style.display = "none";
                        viewframes[x].hide();
                    }
                    document.getElementById("view-trending").style.display = "inline";
                },
                error:function(error){
                    document.getElementById("signin-status").innerHTML = "Failed to sign in";
                }
            });
           }
       });
      }
  }
},

drawEventPage: function(objectId){
	var eventObject, eventPageDisplay;
	var query = new Parse.Query(Event);

	query.get(objectId,{
        success: function(result){
          eventObject = result;
		//     console.log(eventObject);
		eventPageDisplay = new EventPageView();
		eventPageDisplay.render(result);
		app.changeViewTo("view-event");
		document.getElementById("view-event").innerHTML = eventPageDisplay.htmlData;
		
		document.getElementById("goto-last").addEventListener("click", function (){
          console.log(lastPage);
          app.changeViewTo(lastPage);
      });

 },
 error: function(error){
  console.dir(error);
}
});

	EventPageView = Parse.View.extend({
        htmlData:null,
        template:Handlebars.compile(document.getElementById("event-view-tpl").innerHTML),
        render:function(data){
          var jsondata = data.toJSON();
		/*
		  Apply transformations to data
          */
		jsondata.time = ((Date)(jsondata.time)).toString();//toDateString() + " " + jsondata.time.toTimeString();
		this.htmlData= this.template(jsondata);
 }
});


},

trendingPage: {

	eventList: null,
  eventListView: null,   

	setupTrending: function (){
//define eventlistview
        EventListView = Parse.View.extend({
          data:null,
          el:null,
          template:Handlebars.compile(document.getElementById("event-list-tpl").innerHTML),
          render:function(){
              var collection = this.data = {event: this.collection.toJSON()};
              this.organizeList("");
          },
        //
        organizeList: function(mode){
            console.log(mode);
            switch (mode.toLowerCase()){
                case "cost":
                this.data.event = this.sortByKey(this.data.event, "cost", true);
                break;
                default:
                this.data.event = this.sortByKey(this.data.event, "title", true);
                break;
            }

            this.el.innerHTML = this.template(this.data);
                    //this.$el.html(this.template(collection));
                    var cards = this.el.getElementsByClassName("event-card");

                    function renderEventPage(id) {
                     lastPage = "view-trending";
                     app.drawEventPage(id);
                 }

                 for (var i = 0; i < cards.length; i++){
                     renderFunc = renderEventPage.bind(this, cards[i].id);
                     cardImg = $(cards[i]).find("img");
                     cardImg.first().click(renderFunc);
                 }
             },

             sortByKey: function(array, key, ascending) {
                return array.sort(function(a, b) {
                 var x = a[key]; var y = b[key];
                 var diff = ((x < y) ? -1 : ((x > y) ? 1 : 0));
                 return ascending ? diff : -1 * diff;
             }); 
            },

        //
    });

//run the functions

    this.buildList();
    var modeOptions = document.getElementsByClassName("reorder-mode");
    for (var i = 0; i < modeOptions.length; i++){
      modeOptions[i].addEventListener("click", function(){
        app.trendingPage.reorderList(this.innerHTML);
    });
}

},

buildList: function() {
 this.eventList = new EventList(),
 app.trendingPage.drawList();
},

drawList: function(){
    app.trendingPage.eventList.fetch({success:function(eventList){
    app.trendingPage.eventListView = new EventListView({ collection: eventList });
    app.trendingPage.eventListView.render();
    document.getElementById("event-list-display").appendChild(app.trendingPage.eventListView.el);
  }, error:function(error){
      console.dir(error);
  }
});
},

reorderList: function(mode){
    app.trendingPage.eventListView.organizeList(mode);
}

},

mapPage: {
	map: null,
	eventMarkers: [],

	initialize: function() {
        var nyCoord = new google.maps.LatLng(40.7127,-74.0059);
        var canvas = document.getElementById("map-canvas");
            /*canvas.style.width = app.style.width;
              canvas.style.height = app.style.height;
              */
              this.map = new google.maps.Map(document.getElementById("map-canvas"), {
                  zoom: 16,
                  center: nyCoord,
              });
            //this.addMarker(40.7127,-74.0059);
            this.plotEvents();
        },

        addMarker: function(lat, lon, id){
            var temp = this.eventMarkers[this.eventMarkers.length] = new google.maps.Marker({
              position: new google.maps.LatLng(lat,lon),
              map: this.map,
              eventId: id,
          });

            google.maps.event.addListener(temp, 'click', function(){
              app.lastPage = "view-map";
              app.drawEventPage(temp.eventId);
          });
        },

        plotEvents: function(){
         var query = new Parse.Query(Event);
         query.find({
          success: function(result){
              this.eventMarkers = result;
              var temp;
              for (var i = 0; i < result.length; i++){
               temp = result[i].get("location").toJSON();
               app.mapPage.addMarker(temp.latitude, temp.longitude, result[i].id);
           }
       },
       error: function(error){
          console.dir(error);
      }
  });
     },
 },

 profilePage: {

   curUser:null, 

     setupProfilePage: function(){

            this.curUser = Parse.User.current().toJSON();/*function (user) {
							   this.curUser = user;
							   console.log(this.curUser);
                          });*/

console.log(this.curUser);
this.updateInfo();

document.getElementById("edit-profile").addEventListener("click", function(){
  app.profilePage.drawForm();
  document.getElementById("set-bio-info").style.display = "inline";
  document.getElementById("get-bio-info").style.display = "none";
});
},

updateInfo: function(){
    curUser = this.curUser;
    document.getElementById("get-username").innerHTML = curUser.username;
    document.getElementById("get-name").innerHTML = curUser.name;
    document.getElementById("get-email").innerHTML = curUser.password;
    document.getElementById("get-bio").innerHTML = curUser.biography;
},

drawForm: function(){
    curUser = this.curUser;

    document.getElementById("set-username").setAttribute("value", curUser.username);
    document.getElementById("set-name").setAttribute("value", curUser.name);
    document.getElementById("set-email").setAttribute("value", curUser.email);
    document.getElementById("set-bio").innerHTML = curUser.biography;

    var labels = document.getElementsByTagName("label");
    for (var i = 0; i < labels.length; i++){
      labels[i].setAttribute("class","active");
  }

  document.getElementById("save-bio").addEventListener("click", function(e){
      e.preventDefault();
      Parse.User.current().set("name", document.getElementById("set-name").value);
      Parse.User.current().set("biography", document.getElementById("set-bio").value);
      Parse.User.current().save();
      document.getElementById("set-bio-info").style.display = "none";
      document.getElementById("get-bio-info").style.display = "inline";
  });

}

}
};

