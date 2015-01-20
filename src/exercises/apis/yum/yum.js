// Instructions
// ============
// 1. Delete the following block of code:
// -------------------------------------------------------------------------------------------
if ( $('meta[username]').attr('username') !== 'YOUR_USERNAME_HERE!' ) {
	$(document.body).prepend('<h1>Let\'s a-go!</h1>')
} else {
	$(document.body).prepend('<h2 style="color: red">You must set your username in the &lt;meta username&gt; tag</h2>')
}
// -------------------------------------------------------------------------------------------
// 2. Implement the functions in the "search" section. Run checkSearchUI() when you have finished.
// 3. Implement the functions in the "display" section. Run checkDisplayUI() when you have finished.


var ndbapi = new NDBAPI('YOUR API KEY HERE')


// Search
// ======
// Task 1: complete searchResultsTmp by adding a click listener to the name of each returned result
// Task 2: complete search function according to the specification

/**
 * Templates out search results
 * @return {Array} an array of list item elements (no events)
 */
function searchResultsTmp( results ) {
	return results.map( function( result ) {
		var name = $('<span class="name">').html( result.name ),
			group = $('<span class="group">').html( result.group ),
			li = $('<li class="result">').append([ name, group ]),
			ndbno = result.ndbno

		// TODO: add a click listener to `name` that calls showNutritionFacts( ndbno )
		// your code here

		return li[0] // return the vanilla DOM node
	})
}

/**
 * Called when the user presses the "Search" button
 * This function should:
 * 1) query the API for foods matching the params specified in the searchForm
 *    the params are search terms and food group
 * 2) pass the "list.item" property of the returned object to searchResultsTmp()
 * 3) set the innerHTML of the searchResults list to the returned array of list items
 *
 * Hint: Select the searchForm and use jQuery find (https://api.jquery.com/find/) to locate
 *       the user inputs using the CSS name attribute selector
 *       (http://css-tricks.com/attribute-selectors/) and then take its val()
 */
function search() {
	var $searchForm = $('#searchForm')
		// your variables for the user input elements' values here

	ndbapi.search(/* your code here */)
	.done( function( data ) { // this is just a convenient way of specifying the success callback
		// display the search results here
	})
	.fail( function( res ) { // this will be called when the request fails for some reason
		if ( res.status === 404 ) {
			$('#searchResults').html('<li>No results</li>')
		}
	})
}


// Display
// =======
// Task 1: Implement showNutritionFacts based on the specification provided
// Task 2: Implement the onMeasureChange function

/**
 * Displays the nutrition facts for a food item identified by its NDB Number
 * This function should:
 * 1) query the API for the report of the food with the given ndbno
 * 2) on `done`, pass the "report.food" property of the returned object to nutritionFactsTmp
 *    no need for a `fail` handler since we assume that only valid nbdnos were shown
 * 3) display the returned nutrition facts panel in the viewer panel
 *    Hint: inspect the DOM using your browser dev tools to find the viewer panel's selector
 */
function showNutritionFacts( ndbno ) {
	// your code here.
	// it's just like what you did in search() above, except now you don't need the user inputs
}

/**
 * Changes the nutrition facts panel to display facts for a changed measurement
 * This function should:
 * 1) get the value of the <select> that determines measure (passed as `this`)
 * 2) re-template the nutrition facts panel, passing in the value of the select as `measureIndex`
 * 3) place the new nutrition facts panel in the appropriate location
 */
function onMeasureChange( food ) {
	var measureSelect = this
	// your code here
}



/**
 * Templates out a nutrition facts panel given a food item
 * @return {Node} the nutrition facts panel
 */
// You don't have to read past here if you don't want to!

function nutritionFactsTmp( food, measureIndex ) {

	// Below is what happens when you don't use an automatic templating system.
	// Don't worry, though. We /will/ cover templating systems eventually.

	var measureIndex = measureIndex || 0,
		hasNutrients = food.nutrients.filter( function( nutrient ) {
			return parseFloat( nutrient.value ) !== 0
		}),
		nutrientsByName = hasNutrients.reduce( function( byName, nutrient ) {
			byName[ nutrient.name ] = nutrient
			return byName
		}, {} ),
		$facts = $('<div class="nutrition-facts">'),
		$servingSizer = food.nutrients[0].measures.reduce( function( $sizer, measure, i ) {
			var size = measure.qty + ' ' + measure.label,
				$option = $('<option>')
					.attr( 'selected', ( i === parseInt( measureIndex ) ? 'true' : null ) )
					.val( i ).html( size )
			return $sizer.append( $option )
		}, $('<select name="serving-sizer">') )
		$servingSize = $('<div class="serving-size">')
			.append('Serving size:&nbsp;').append( $servingSizer ),
		$bigHr = $('<hr class="rule big">'),
		$rule = $('<hr class="rule">'),
		$ruleMed = $('<hr class="rule med">'),
		$inlineHeading = $('<span class="inline-heading">'),
		makeSubnutrients = function( nutrientNames ) {
			return nutrientNames.reduce( function( $list, nutrientName ) {
				var nutrient = nutrientsByName[ nutrientName.dataName ],
					$li = $('<li>'),
					nutrientValue

				if ( nutrient === undefined ) {
					return $list
				}

				nutrientValue = parseFloat( nutrient.measures[ measureIndex ].value ).toFixed(1) +
					'  ' + nutrient.unit
				$li.html( nutrientName.displayName + ' ' + nutrientValue )
					.attr( 'data-testFixture', nutrientName.displayName )
				return $list.append( $li )
			}, $('<ul class="subnutrients">') )
		},
		nutrient = function( name ) {
			var nute = nutrientsByName[ name ]
			if ( nute === undefined ) {
				return 0;
			}
			return Math.round( parseFloat( nute.measures[ measureIndex ].value ) ).toFixed(0) + nute.unit
		}


	$servingSizer.on( 'change', onMeasureChange.bind( $servingSizer[0], food ) )


	if ( food.nutrients[0].measures.length === 0 ) {
		return $facts
		.append('<h1 class="facts-heading">Nutrition Facts</h1>')
		.append('<h3 class="facts-food">' + food.name + '</h3>')
		.append('<h3 class="facts-food">No measurement data</h3>')
	}

	$facts
	.append('<h1 class="facts-heading">Nutrition Facts</h1>')
	.append('<h3 class="facts-food">' + food.name + '</h3>')
	.append( $servingSize )
	.append( $bigHr.clone() )
	.append( $inlineHeading.clone().html('Amount per serving') )
	.append( $rule.clone() )
	.append( $inlineHeading.clone().html('Calories') )
	.append( nutrientsByName.Energy.measures[ measureIndex ].value )
	.append( $ruleMed.clone() )
	.append( $inlineHeading.clone().html('Total Fat') )
	.append( nutrient('Total lipid (fat)') )
	.append( makeSubnutrients([
		{ dataName: 'Fatty acids, total saturated', displayName: 'Saturated Fat' },
		{ dataName: 'Fatty acids, total monounsaturated', displayName: 'Monounsaturated Fat' },
		{ dataName: 'Fatty acids, total polyunsaturated', displayName: 'Polyunsaturated Fat' }
	]) )
	.append( $rule.clone() )
	.append( $inlineHeading.clone().html('Cholesterol') )
	.append( nutrient('Cholesterol') )
	.append( $rule.clone() )
	.append( $inlineHeading.clone().html('Sodium') )
	.append( nutrient('Sodium, Na') )
	.append( $rule.clone() )
	.append( $inlineHeading.clone().html('Total Carbohydrate') )
	.append( nutrient('Carbohydrate, by difference') )
	.append( makeSubnutrients([
		{ dataName: 'Fiber, total dietary', displayName: 'Dietary Fiber' },
		{ dataName: 'Sugars, total', displayName: 'Sugars' }
	]) )
	.append( $rule.clone() )
	.append( $inlineHeading.clone().html('Protein') )
	.append( nutrient('Protein') )
	.append( $bigHr.clone() )

	return $facts[0]
}
