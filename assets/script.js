'use strict';
// First let's define the usual configuration variables for our index
var applicationId = 'E7SKP9FREI';
var apiKey = '9aa94c2c24705a4973e571d1b645da1d';
var index = 'cars';
var client = algoliasearch(applicationId, apiKey);

// Define the `AgoliaSearchHelper` module
angular.module('AlgoliaSearchHelper', ['ngSanitize']).

// Expose the helper
factory('helper', function() {
  return algoliasearchHelper(client, index, {
    disjunctiveFacets: ['category'],
    hitsPerPage: 7,
    maxValuesPerFacet: 3
  });
}).

// Define the search-box
component('searchBox', {
  template: `
    <input
      placeholder="Search.."
      class="search-box"
      ng-keyup=search($evt)
      ng-model="query"
    />`,
  controller: function SearchBoxController($scope, helper) {
    $scope.query = '';
    $scope.search = function() {
      helper.setQuery($scope.query).search();
    };

    helper.setQuery('').search();
  }
}).

// Define the search-facets
component('searchFacets', {
  template: `<ul class="facet-list">
              <span ng-repeat="facet in facets">
                <li
                   ng-click="toggleFacet(facet.name)"
                   ng-class="{active: facet.isRefined}">
                  <label><input
                    type="checkbox"
                    data-val="facet.name"/>
                  <span ng-bind-html="facet.name"></span> 
                  <span class="badge" ng-bind-html="facet.count"></span>
                  </label>
                </li>
              </span>
            </ul>`,
  controller: function SearchFacetsController($scope, helper) {
    $scope.toggleFacet = function (name) {
      helper.toggleRefinement('category', name).search()
    };
    helper.on('result', results => {
      $scope.$apply($scope.facets = results.getFacetValues('category'));
    });
  }
}).

// Define the search-results
component('searchResult', {
  template: `
    <div class="hit results">
      <span ng-repeat="hit in hits">
        <div ng-bind-html="hit._highlightResult.model.value"></div>
      </span>
      <span ng-if="hits.length === 0">
        No results found 😓
      </span>
    </div>`,
  controller: function SearchResultController($scope, helper) {
    $scope.hits = [];

    helper.on('result', results => {
      $scope.$apply($scope.hits = results.hits);
    });
  }
}).

// Define the search-pagination
component('searchPagination', {
  template: `<div class="pager">
      <button class="previous" ng-click="previousPage()">Previous</button>
      <span class="current-page"><span ng-bind-html="page"></span></span>
      <button class="next" ng-click="nextPage()">Next</button>
    </div>`,
  controller: function SearchPaginationController($scope, helper) {

    helper.on('result', results => {
         $scope.$apply($scope.page = "" + (results.page + 1) );
    });

    $scope.nextPage = function() {
      helper.nextPage().search();
    };

    $scope.previousPage = function() {
      helper.previousPage().search();
    };
  }
});