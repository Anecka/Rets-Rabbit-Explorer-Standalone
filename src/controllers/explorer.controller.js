(function() {
    'use strict';
    angular
        .module('app.controller.explorer', [])
        .controller('ExplorerCtrl', Controller);

    Controller.$inject = ['$scope', '$window', '$timeout', 'MetadataFactory', 'QueryFactory'];

    function Controller($scope, $window, $timeout, MetadataFactory, QueryFactory) {
    	var vm = this;

    	init();

    	function init () {
            console.log('Init the explorer controller');
    		vm.data = {
                metadata: {
                    search: '',
                    hidden: true,
                    fields: MetadataFactory.fields()
                },
                query_info: {
                    hidden: true
                },
                queries: QueryFactory.queries(),
                fillQuery: null
            };


            vm.toggleMeta = _toggleMeta;
            vm.filterMeta = _filterMeta;
            vm.fillQuery = _fillQuery;

            vm.toggleQueryInfo = _toggleQueryInfo;
    	}

        /* --- FUNCTIONS --- */
        function _filterMeta() {
            if(vm.data.metadata.search === '') {
                vm.data.metadata.fields = MetadataFactory.fields();
                return;
            }

            vm.data.metadata.fields = MetadataFactory.fields().filter(function (field){
                if(field.name.toLowerCase().indexOf(vm.data.metadata.search.toLowerCase()) != -1)
                    return field;

                if(field.type.toLowerCase().indexOf(vm.data.metadata.search.toLowerCase()) != -1)
                    return field;
            });
        }

        function _toggleMeta() {
            if(vm.data.query_info.hidden == true && vm.data.metadata.hidden == true){
                vm.data.query_info.hidden = false;
            }

            vm.data.metadata.hidden = !vm.data.metadata.hidden;
            //do other stuff if necessary
        }

        function _fillQuery(query){
            vm.data.fillQuery = query;
        }

        function _toggleQueryInfo() {
            vm.data.query_info.hidden = !vm.data.query_info.hidden;
            //do other stuff if necessary
        }
    }
})();