'use strict';

/* VMA App Module */
angular.module('volunteerManagementApp', [
    'ionic', //delete later
    'vmaControllerModule',
    'databaseServicesModule',
    'vmaServicesModule',
    'vmaDirectiveModule',
    'vmaFilterModule',
    'restangular',
    'ngNotify',
    'highcharts-ng',
    'adaptive.googlemaps',
    'ui.bootstrap.datetimepicker',
    'checklist-model',
    'angularFileUpload',
    "isteven-multi-select",
    'mobile-angular-ui.core.activeLinks',
    'mobile-angular-ui.core.fastclick',  
    'mobile-angular-ui.core.sharedState',
    'mobile-angular-ui.core.outerClick', 
    'mobile-angular-ui.components.modals',
    'mobile-angular-ui.components.switch',
    'mobile-angular-ui.components.sidebars',    
    'mobile-angular-ui.components.scrollable',   
    // 'mobile-angular-ui.components.capture', //needed?
    'mobile-angular-ui.components.navbars' 
]).

config(function($stateProvider, $urlRouterProvider, $compileProvider, RestangularProvider) {
    $urlRouterProvider.otherwise("/homePage");
    $stateProvider.
        state('home', {
            views: {
                "menuBar@home": { templateUrl: "partials/menuBar.html", controller:"menuCtrl"},
                "app": { templateUrl: "partials/home.html"},
                "header@": { templateUrl: "partials/header.html"},
                "bottomMenu":  { templateUrl: "partials/bottomMenu.html", controller:"menuCtrl"}
            },
            authenticate: true
        }).
        state('home.login', {
            url: "/login",
            views: {
                "app": {templateUrl: "partials/login.html", controller: 'loginCtrl'}
            },
            authenticate: false
        }).
        state('home.register', {
            url: "/register",
            views: {
                "app": { templateUrl: "partials/register.html", controller: 'registerCtrl'}
            },
            authenticate: false
        }).
        state('home.availableClasses', {
            url: "/avClasses",
            views: {
                "app": { templateUrl: "partials/availableClasses.html", controller: 'taskController'}
            },
            authenticate: true
        }).
        state('home.message', {
            url: "/messages/:id",
            views: {
                "app@home": { templateUrl: "partials/groupMessages.message.html", controller: 'message'}
            },
            authenticate: true
        }).
        state('home.groupFeed', {
            url: "/groupFeed",
            views: {
                "app": { templateUrl: "partials/groupFeed.html", controller: 'postController'}
            },
            authenticate: true
        }).
        state('home.myGroups', {
            cache: false,
            url: "/myGroups",
            views: {
                "app": { templateUrl: "partials/myGroups.html", controller: 'groupController'}
            },
            authenticate: true
        }).
        state('home.joinGroups', {
            url: "/joinGroups",
            views: {
                "app": { templateUrl: "partials/groups.html", controller: 'groupController'}
            },
            authenticate: true
        }).
        state('home.group', {
            url: "/group/:id",
            views: {
                "app": { templateUrl: "partials/efforts.group.html", controller: 'groupController'}
            },
            resolve: {
                group: function(vmaGroupService, $stateParams) {
                    return vmaGroupService.getGroupMeta($stateParams.id).then(function(success) { $stateParams.group = success;});
                }
            },
            authenticate: true
        }).
        state('home.group.posts', {
            url: "/posts",
            views: {
                "app@home": { templateUrl: "partials/groupFeed.post.html", controller: 'postController'}
            },
            authenticate: true
        }).
        state('home.group.posts.comments', {
            url: "/:post_id",
            views: {
                "app@home": { templateUrl: "partials/viewPost.html", controller: 'comments'}
            },
            authenticate: true
        }).
        state('home.group.tasks', {
            url: "/tasks",
            views: {
                "app@home": { templateUrl: "partials/groupFeed.task.html", controller: 'taskController'}
            },
            authenticate: true
        }).
        state('home.task', {
            url: "/taskview/:task",
            views: {
                "app": { templateUrl: "partials/viewTask.html", controller: 'task'}
            },
            resolve: {
                task: function(vmaTaskService, $stateParams) {
                    return vmaTaskService.updateTasks().then(function(){
                        return vmaTaskService.getTaskView($stateParams.task).then(function(success){
                            return success;
                        });
                    });
                }
            },
            authenticate: true
        }).
        state('home.myTasks', {
            url: "/myTasks",
            views: {
                "app": { templateUrl: "partials/myTasks.html", controller: 'taskController'}
            },
            authenticate: true
        }).
        state('home.myInvites', {
            url: "/myInvites",
            views: {
                "app": { templateUrl: "partials/myInvites.html", controller: 'efforts'}
            },
            authenticate: true
        }).
        state('home.awards', {
            url: "/awards",
            views: {
                "app": { templateUrl: "partials/awards.html", controller: 'awards'}
            },
            resolve: {
                tasks: function(vmaHourService) {
                    return vmaHourService.getMyHoursWithTasks(100000, null, null, false);
                }
            },
            authenticate: true
        }).
        state('home.hours_mod', {
            url: "/hours_mod:group_id",
            views: {
                "app": { templateUrl: "partials/hours.moderation.html", controller: "hours.moderation"}
            },
            authenticate: true
        }).
        state('home.settings', {
            url: "/settings",
            views: {
                "app": { templateUrl: "partials/settings.html", controller: "settings"}
            },
            authenticate: true
        }).
        state('home.calendar', {
            url: "/calendar",
            views: {
                "app": { templateUrl: "partials/calendar.html", controller: "calendar"}
            },
            authenticate: true
        }).
        state('home.about', {
            url: "/about",
            views: {
                "app": { templateUrl: "partials/about.html", controller: "about"}
            },
            authenticate: true
        }).
        state('home.intro', {
            url: "/intro",
            views: {
                "app": { templateUrl: "partials/intro.html", controller: "intro"}
            },
            authenticate: true
        }).
        state('home.hours', {
            cache: false,
            url: "/hours",
            views: {
                "app": { templateUrl: "partials/hours.myHours.html", controller: "hoursController"}
            },
            authenticate: true
        }).
        state('home.myHours', {
            url: "/myCertificates",
            views: {
                "app": { templateUrl: "partials/myCertificates.html", controller: "hoursController"}
            },
            authenticate: true
        }).
        state('home.userPicture', {
            url: "/userPicture",
            views: {
                "app@home": { templateUrl: "partials/userPicture.html", controller: "userPicture"}
            },
            authenticate: true
        }).
        state('home.homePage', {
            url: "/homePage",
            views: {
                "app": { templateUrl: "partials/homePage.html", controller: "homeCtrl"}
            },
            resolve: {
                groups: function(vmaGroupService) {
                    vmaGroupService.updateGroups(true);
                }
            },
            authenticate: true
        });
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|geo|maps):/);
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
}).

// constant('$ionicLoadingConfig', {
//     content: 'Loading',
//     animation: 'fade-in',
//     showBackdrop: true,
//     maxWidth: 200,
//     showDelay: 0
// }).


run(['Restangular', '$rootScope', 'Auth', '$q', '$state', 'vmaUserService', 'ngNotify', function(Restangular, $rootScope, Auth, $q, $state, vmaUserService, ngNotify) {
    // Restangular.setBaseUrl("http://localhost:8080/RESTFUL-WS/");     //Localhost for development
    // $rootScope.serverRoot = "http://localhost:8080/";
    // $rootScope.serverRootUpload = "http://localhost:8080/RESTFUL-WS/";    

    Restangular.setBaseUrl("https://www.housuggest.org:8443/CHWApp/");     //HOUSUGGEST FOR VMA CORE
    $rootScope.serverRoot = "http://www.housuggest.org/";
    $rootScope.serverRootUpload = "https://www.housuggest.org:8443/CHWApp/";
    // $rootScope.stateHistory=[];
    //TO ACCESS RESTANGULAR IN CONTROLLERS WITHOUT INJECTION
    $rootScope.Restangular = function() {
        return Restangular;
    };
    //BACK BUTTON
    $rootScope.toprevState = function() {
        $state.go($rootScope.prevState);
        // console.log($rootScope.curState+"//"+$rootScope.prevState)
        // console.log($rootScope.States)
    };
    //CHECKING IF AUTHENTICATED ON STATE CHANGE - Called in $stateChangeStart
    $rootScope.isAuthenticated = function(authenticate) {
        if (!Auth.hasCredentials()) {
            $rootScope.isGuest = true;
            Auth.setCredentials("Guest", "21d7dcf66c3e4ad8daf654c8732791453a79408d312396dc25ec90453597f5bdf7dca5ac87b8c22c140d6b4dd17753bd2640b517d486d34d9e52d1a444560a93");
            Auth.confirmCredentials();
        }
        vmaUserService.getMyUser().then(function (result) {
            result = Restangular.stripRestangular(result)[0];
            //USERNAME & ID TO BE USED IN CONTROLLERS
            $rootScope.uid = result.id.toString();
            $rootScope.uin = result.username.toString();
            $rootScope.isGuest = (result.username.toString() == "Guest");
        });
        vmaUserService.getMyRole().then(function (success) {
            $rootScope.role = success;
            $rootScope.isMod = (success == "ROLE_MODERATOR");
            $rootScope.isAdm = (success == "ROLE_ADMIN");
        }, function (error) {
            if (error.status === 0) { // NO NETWORK CONNECTION OR SERVER DOWN, WE WILL NOT LOG THEM OUT
                ngNotify.set("Internet or Server Unavailable", {type: "error", sticky: true});
            } else { //Most Likely a 403 - LOG THEM OUT
                Auth.clearCredentials();
                if (authenticate) {
                    $state.go("login");
                    location.reload();
                }
            }
        });
        return Auth.hasCredentials();
    };

    $rootScope.badgeConfig = [
        "Advocacy",
        "Capacity Building",
        "Communication Skills",
        "Community Service",
        "Coordination",
        "Interpersonal Communication",
        "Knowledge Base",
        "Organizational",
        "Service Coordination",
        "Skills",
        "Teaching Skills"
    ];
    $rootScope.goToLink = function(url){
        window.open(url,"_system");
    };

    //AUTHENTICATE ON CHANGE STATE
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
        $('body').removeClass('loaded');
        //if (toState.authenticate==undefined){toState.authenticate=true};
        if (toState.authenticate && !$rootScope.isAuthenticated(toState.authenticate)){
            // User isn’t authenticated
            $state.go("login");
            //Prevents the switching of the state
            event.preventDefault();
        }
        $rootScope.prevState = $state.current.name;
    });
    $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams){
        $('body').addClass('loaded');
        $rootScope.curState = $state.current.name;
        // $rootScope.States.push($rootScope.curState);
        // $rootScope.States.push($param);
        // [].push.apply($scope.HouseBasket, data);
    });
    $rootScope.$on("$stateChangeError", function(){
        $('body').addClass('loaded');
    });
}]);


