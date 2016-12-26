// Submit task
angular.module('TaskApp').controller('SubmitTaskCtrl',
function($scope, $mdDialog){
	$scope.labels = ["None","Red","Orange","Yellow","Green","Blue","Purple"];
	$scope.file = 'No File';

	//////////////////////////
	// add task to database //
	//////////////////////////
	$scope.submit = function(){
		var data = {
			title: $scope.title,
			desc: $scope.desc,
			date: $scope.date,
			label: $scope.label,
			file: $scope.file
		}
		if (!data.title || !data.desc || !data.date || !data.label)
			$scope.error = true;
		else{
			var user = firebase.auth().currentUser;
			if (user){
				var ref = firebase.database().ref('users/' + user.uid);
				ref.once('value', function(snapshot){
					callBack(snapshot.val().current);
				});
			}
			$scope.cancel();
		}
		function callBack(board){
			if (board){
				firebase.database().ref('tasks/' + board).push({
					title: data.title,
					due: data.date.getTime(),
					desc: data.desc,
					label: data.label,
					file: data.file,
					stage: 0
				});
			}
		};
	};

	///////////////////////////
	// add google drive file //
	///////////////////////////
	$scope.googleDrive = function(){

		// The Browser API key obtained from the Google Developers Console.
		var developerKey = 'AIzaSyDL7_8sVdnD0OcMtR0_tBMykVt_256u5Xc';
		// The Client ID obtained from the Google Developers Console. Replace with your own Client ID.
		var clientId = "533681754473-o4oubuhhro4h2mafjr4ok1370596j490.apps.googleusercontent.com";
		// Scope to use to access user's photos.
		var scope = ['https://www.googleapis.com/auth/drive.readonly'];
		var pickerApiLoaded = false;
		var oauthToken;

		// Use the API Loader script to load google.picker and gapi.auth.
		function onApiLoad() {
			gapi.load('auth', {'callback': onAuthApiLoad});
			gapi.load('picker', {'callback': onPickerApiLoad});
		}

		function onAuthApiLoad() {
			window.gapi.auth.authorize(
			{
				'client_id': clientId,
				'scope': scope,
				'immediate': false
			},
			handleAuthResult);
		}

		function onPickerApiLoad() {
			pickerApiLoaded = true;
			createPicker();
		}

		function handleAuthResult(authResult) {
			if (authResult && !authResult.error) {
				oauthToken = authResult.access_token;
				createPicker();
			}
		}

		function createPicker() {
			if (pickerApiLoaded && oauthToken) {
				var view = new google.picker.DocsView()
					.setParent('root')
					.setIncludeFolders(true);
				var picker = new google.picker.PickerBuilder()
					.addView(view)
					.enableFeature(google.picker.Feature.NAV_HIDDEN)
            		// .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
					.setOAuthToken(oauthToken)
					.setDeveloperKey(developerKey)
					.setCallback(pickerCallback)
					.build();
				picker.setVisible(true);
			}
		}

		// A simple callback implementation.
		function pickerCallback(data) {
			var url = 'nothing';
			if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
				var doc = data[google.picker.Response.DOCUMENTS][0];
				url = doc[google.picker.Document.URL];
			}
			if (url != 'nothing'){
				$scope.file = url;
				$scope.$apply();
			}
		}

		onApiLoad();
	};

	//////////////////////////////
	// remove google drive file //
	//////////////////////////////
	$scope.removeFile = function(){
		$scope.file = 'No File';
	};

	////////////////////////////////
	// cancel task and clear form //
	////////////////////////////////
	$scope.cancel = function(){
		$mdDialog.hide();
		$scope.title = null;
		$scope.desc = null;
		$scope.date = null;
		$scope.label = null;
		$scope.error = false;
		$scope.file = 'No File';
	};
});
