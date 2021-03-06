var index = angular.module('index', ['ngRoute']);

index.value('duScrollDuration', 2000);
index.value('duScrollOffset', 30);

index.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider
		.when('/', {
			title: 'IMDb2 - Internet Movies Database 2',
			templateUrl : 'partials/view.html',
			controller  : 'mainCtrl'
		})
		.when('/movies', {
			title: 'Movies List - IMDb2',
			templateUrl : 'partials/movieList.html',
			controller  : 'MoviesListCtrl'
		})
		.when('/movies/:id', {
      title: ' - IMDb2',
			templateUrl : 'partials/movies.html',
			controller  : 'MoviesCtrl'
		})
    .when('/people', {
      title: 'People List - IMDb2',
      templateUrl: 'partials/peopleList.html',
      controller: 'PeopleListCtrl'
    })
    .when('/people/:id', {
      title: ' - IMDb2',
      templateUrl: 'partials/people.html',
      controller: 'PeopleCtrl',
    })
		.otherwise({
			redirectTo: '/'
		});
  $locationProvider.html5Mode(true);
}]);

index.run(['$location', '$rootScope', function($location, $rootScope) {
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        $rootScope.title = current.$$route.title;
    });
}]);

index.controller('mainCtrl', function($scope, $http, $location) {
  $scope.isActive = function(locationPath) {
    if ($location.path().match(locationPath)) return true;
    else return false;
  };
});

index.filter('startFrom', function() {
    return function(input, start) {
    	if (!input || !input.length) return;
    	return input.slice(start);
  	};
});

index.filter('object2Array', function() {
  return function(input) {
    var out = []; 
    for(i in input){
      out.push(input[i]);
    }
    return out;
  }
});

index.controller('MoviesListCtrl', function ($scope, $http, $window) {
	$http.get('/api/movies').success(function(data) {
    	$scope.movies = data;
	});
	$scope.currentPage = 0;
	$scope.pageSize = 25;
	$scope.numberOfPages = function(){
		if (!$scope.movies || !$scope.movies.length) return;
		return Math.floor($scope.movies.length/$scope.pageSize)+1;
	};
	$scope.getNumber = function(num) {
	    return new Array(num);   
	};
	$scope.pageClass = function(page){
		return page == $scope.currentPage ? 'active' : '';
	};
	$scope.changePage = function(page){
		$scope.currentPage = page;
	};
  $scope.submitForm = function() {
    $http({
      method: 'POST',
      url: 'api/movies',
      data: $.param({
        Movie_Id: $scope.form.MovieId,
        Movie_Title: $scope.form.MovieTitle,
        Release_Date: $scope.form.ReleaseDate,
        Duration: $scope.form.Duration,
        Rating: $scope.form.Rating,
        Director: $scope.form.Director,
        Img_Src: $scope.form.ImgSrc,
        Description: $scope.form.Description,
        Country: $scope.form.Country,
        Language: $scope.form.Language,
        Company: $scope.form.Company
      }),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function() {
      $window.location.href = '/movies';
    });
  }             
});


index.controller('MoviesCtrl', function ($rootScope, $scope, $http, $window, $location, $routeParams) {
	$http.get('/api/movies').success(function(data) {
    $scope.total = data.length;
  });
  $http.get('api/awardMovie/'+$routeParams.id).success(function(data){
    $scope.awards = data;
  });
  $http.get('api/award').success(function(data){
    $scope.awardsName = data;
  });
  $http.get('/api/movies/'+$routeParams.id).success(function(data) {
    if (data.length !== 0) $scope.movie = data;
    else $location.path("/movies");

    $rootScope.title = $scope.movie.Movie_Title + " - IMDb2";
    $scope.formset($scope.movie);
    $http.get('api/actMovie/'+$scope.movie.Movie_Id).success(function(data) {
      $scope.acts = data;
    });
    $http.get('api/people/').success(function(data) {
      $scope.people = data;
      $http.get('api/people/'+$scope.movie.Director).success(function (data2){
        $scope.director = data2.People_Name;
      });
    });
	});	
  $scope.randomMovie = function(data) {
    var rand = Math.floor((Math.random()*data));
    while (rand === $routeParams.id*1){
      rand = Math.floor((Math.random()*data));
    }
    $location.path("/movies/"+rand);
    return rand;
  };
  $scope.removeMovie = function(data) {
    var id = data.Movie_Id;
    $http({
      method: 'DELETE',
      url: 'api/movies/'+id,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function() {
      $location.path("/movies");
    });
  };
  $scope.formset = function(data) {
    $scope.form = {
      MovieId: data.Movie_Id,
      MovieTitle: data.Movie_Title,
      ReleaseDate: data.Release_Date,
      Duration: data.Duration,
      Rating: data.Rating,
      Director: data.Director,
      ImgSrc: data.Img_Src,
      Description: data.Description,
      Country: data.Country,
      Language: data.Language,
      Company: data.Company
    };
    $scope.form2 = {
      PoepleId: data.People_Id,
      Character: data.Character
    }
  };
  $scope.updateMovie = function(data) {
    var id = data.Movie_Id;
    $http({
      method: 'PUT',
      url: 'api/movies/'+id,
      data: $.param({
        Movie_Id: $scope.form.MovieId,
        Movie_Title: $scope.form.MovieTitle,
        Release_Date: $scope.form.ReleaseDate,
        Duration: $scope.form.Duration,
        Rating: $scope.form.Rating,
        Director: $scope.form.Director,
        Img_Src: $scope.form.ImgSrc,
        Description: $scope.form.Description,
        Country: $scope.form.Country,
        Language: $scope.form.Language,
        Company: $scope.form.Company
      }),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function() {
      $window.location.href = '/movies/'+id;
    })
  }; 
  $scope.updateAct = function() {
    var mid = $routeParams.id;
    var pid = $scope.form2.PeopleId;
    $http.get('api/actMovie/'+mid+'/'+pid).success(function(data) {
      if (data.length !== 0) {
        $http({
          method: 'PUT',
          url: 'api/actMovie/'+mid+'/'+pid,
          data: $.param({
            Movie_Id: mid,
            People_Id: pid,
            Character: $scope.form2.Character
          }),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function() {
          $window.location.href = '/movies/'+mid;
        });
      }
      else {
        $http({
          method: 'POST',
          url: 'api/actMovie/',
          data: $.param({
            Movie_Id: mid,
            People_Id: pid,
            Character: $scope.form2.Character
          }),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function() {
          $window.location.href = '/movies/'+mid;
        });
      }
    });
  };
  $scope.deleteAct = function(data) {
    var mid = data.Movie_Id;
    var pid = data.People_Id;
    $http({
      method: 'DELETE',
      url: 'api/actMovie/'+mid+'/'+pid,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function() {
      $window.location.href = '/movies/'+mid;
    });
  };
  $scope.updateAward = function() {
    var mid = $routeParams.id;
    var aid = $scope.form3.Award_Id;
    var y = $scope.form3.Year;
    $http.get('api/awardMovie/'+mid+'/'+aid+'/'+y).success(function(data) {
      if (data.length !== 0) {
        $http({
          method: 'PUT',
          url: 'api/awardMovie/'+mid+'/'+aid+'/'+y,
          data: $.param({
            Movie_Id: mid,
            Award_Id: aid,
            Type: $scope.form3.Type,
            Year: y
          }),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function() {
          $window.location.href = '/movies/'+mid;
        });
      }
      else {
        $http({
          method: 'POST',
          url: 'api/awardMovie/',
          data: $.param({
            Movie_Id: mid,
            Award_Id: aid,
            Type: $scope.form3.Type,
            Year: y
          }),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function() {
          $window.location.href = '/movies/'+mid;
        });
      }
    });
  };
  $scope.deleteAward = function(data) {
    var mid = data.Movie_Id;
    var aid = data.Award_Id;
    var y = data.Year;
    $http({
      method: 'DELETE',
      url: 'api/awardMovie/'+mid+'/'+aid+'/'+y,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function() {
      $window.location.href = '/movies/'+mid;
    });
  };
});


index.controller('PeopleListCtrl', function($scope, $http, $window) {
  $http.get('/api/people').success(function(data) {
      $scope.people = data;
  });
  $scope.currentPage = 0;
  $scope.pageSize = 25;
  $scope.numberOfPages = function(){
    if (!$scope.people || !$scope.people.length) return;
    return Math.floor($scope.people.length/$scope.pageSize)+1;
  };
  $scope.getNumber = function(num) {
      return new Array(num);   
  };
  $scope.pageClass = function(page){
    return page == $scope.currentPage ? 'active' : '';
  };
  $scope.changePage = function(page){
    $scope.currentPage = page;
  };
  $scope.submitForm = function() {
    $http({
      method: 'POST',
      url: 'api/people',
      data: $.param({
        People_Id: $scope.form.People_Id,
        People_Name: $scope.form.People_Name,
        Birth_Date: $scope.form.Birth_Date,
        Country: $scope.form.Country,
        Img_Src: $scope.form.Img_Src,
        Description: $scope.form.Description
      }),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function() {
      $window.location.href = '/people';
    });
  };     
});


index.controller('PeopleCtrl', function ($rootScope, $scope, $http, $window, $location, $routeParams) {
  $http.get('/api/people').success(function(data) {
    $scope.total = data.length;
  });
  $http.get('/api/people/'+$routeParams.id).success(function(data) {
    if (data.length !== 0) $scope.person = data;
    else $location.path("/people");

    $rootScope.title = $scope.person.People_Name + " - IMDb2";
    $scope.formset($scope.person);
    $http.get('api/people/').success(function(data) {
      $scope.people = data;
    });
  }); 
  $scope.randomPerson = function(data) {
    var rand = Math.floor((Math.random()*data));
    while (rand === $routeParams.id*1){
      rand = Math.floor((Math.random()*data));
    }
    $location.path("/people/"+rand);
    return rand;
  };
  $scope.removePerson = function(data) {
    var id = data.People_Id;
    $http({
      method: 'DELETE',
      url: 'api/people/'+id,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function() {
      $location.path("/people");
    });
  };
  $scope.formset = function(data) {
    $scope.form = {
      People_Id: data.People_Id,
      People_Name: data.People_Name,
      Birth_Date: data.Birth_Date,
      Country: data.Country,
      Img_Src: data.Img_Src,
      Description: data.Description
    };
  };
  $scope.updatePerson = function(data) {
    var id = data.People_Id;
    $http({
      method: 'PUT',
      url: 'api/people/'+id,
      data: $.param({
        People_Id: $scope.form.People_Id,
        People_Name: $scope.form.People_Name,
        Birth_Date: $scope.form.Birth_Date,
        Country: $scope.form.Country,
        Img_Src: $scope.form.Img_Src,
        Description: $scope.form.Description
      }),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function() {
      $window.location.href = '/people/'+id;
    })
  }; 
}); 
