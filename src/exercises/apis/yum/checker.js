var _NDBAPI = new NDBAPI('p7o78AUY4ykMowW4I2UUU4EmfAcrQm7ws5RixhWH')

function _expectAjaxUrl( expected ) {
	$(document).ajaxSend( function( _, _, reqOpts ) {
		var endOfEndpoint = reqOpts.url.indexOf('?') !== -1 ?
				reqOpts.url.indexOf('?') : reqOpts.url.length,
			actual = reqOpts.url.substring( 0, endOfEndpoint )

		if ( actual !== expected ) {
			$(document).unbind('ajaxSend')
			throw Error('Incorrect request URL. Expected "' + expected + '" but was "' + actual + '"')
		}
	})
}

function _attachBasicFeedback( req ) {
	req.fail( function( res ) {
		if ( res.status === 403 ) {
			console.error('Error: checkMakeRequest failed (' + res.status + ' ' + res.statusText + '). API key must be included in request params')
		}
	})
	.always( function() {
		$(document).unbind('ajaxSend')
	})
}

function checkMakeRequest( done ) {
	if ( !done ) _expectAjaxUrl('https://api.data.gov/usda/ndb/reports')

	var params = {
			ndbno: '08120',
			type: 'b'
		},
		endpoint = '/reports',
		req = _NDBAPI._makeRequest( endpoint, params ),
		donefn = done || function(){}

	_attachBasicFeedback( req )

	req.done( function( data ) {
		var report = data.report
		if ( report.type !== 'Basic' || report.food.ndbno !== '08120' ) {
			console.error('Error: Request parameters not set.')
			donefn( false )
		} else {
			console.log('_makeRequest success!')
			donefn( true )
		}
	})

	console.log('Checking _makeRequest...')
}

function checkSearch( done ) {
	if ( !done ) _expectAjaxUrl('https://api.data.gov/usda/ndb/search')

	var terms = 'rolled oats',
		bigterm = 'rice',
		foodgroup = 'Breakfast Cereals'
		endpoint = '/reports',
		perPage = 30,
		pageNo = 2,
		reqBasic = _NDBAPI.search( terms ),
		reqIntermediate = _NDBAPI.search( terms, foodgroup ),
		reqAdvanced = _NDBAPI.search( bigterm, '', pageNo, perPage ),
		attachFeedback = function( req ) {
			_attachBasicFeedback( req )
			req.fail( function( res ) {
				if ( res.status === 400 ) {
					console.error('Error (400 Bad Request): ' + res.responseJSON.errors.error[0].message)
				} else if ( res.status === 404 ) {
					console.error('Error (404 Not found): Search terms not set correctly')
				} else {
					console.error('Error (' + res.status + ' ' + res.statusText + ')')
				}
				donefn( false )
			})
		},
		donefn = done || function(){}

	attachFeedback( reqBasic )
	attachFeedback( reqIntermediate )
	attachFeedback( reqAdvanced )

	reqBasic.done( function( data ) {
		var results = data.list
		if ( results.q !== 'rolled oats' ) {
			console.error('Error: Search term not correctly set. Expected "rolled oats" but was "' + results.q + '"')
			donefn( false )
		} else if ( results.group !== '' ) {
			console.error('Error: expected no food group but was "' + results.group + '"')
			donefn( false )
		} else {
			console.log('search basic success!')
			donefn( true )
		}
	})

	reqIntermediate.done( function( data ) {
		var results = data.list
		if ( results.group !== 'Breakfast Cereals' ) {
			console.error('Error: "Breakfast Cerals" food group but was "' + results.group + '"')
			donefn( false )
		} else {
			console.log('search intermediate success!')
			donefn( true )
		}
	})

	reqAdvanced.done( function( data ) {
		var results = data.list
		if ( results.end !== 30 || results.item[0].group.indexOf('Cereal') === -1 ) {
			console.error('Error: Pagination not set correctly')
			donefn( false )
		} else {
			console.log('search advanced success!')
			donefn( true )
		}
	})

	console.log('Checking search basic (just search terms)...')
	console.log('Checking search intermediate (with food group)...')
	console.log('Checking search advanced (with pagination)...')
}

function checkGetReport( done ) {
	if ( !done ) _expectAjaxUrl('https://api.data.gov/usda/ndb/reports')

	var ndbno = '08120',
		endpoint = '/reports',
		req = _NDBAPI.getReport( ndbno ),
		donefn = done || function(){}

	_attachBasicFeedback( req )

	req.done( function( data ) {
		var report = data.report
		if ( report.type !== 'Basic' || report.food.ndbno !== '08120' ) {
			console.error('Error: Request parameters not set.')
			donefn( false )
		} else {
			console.log('getReport success!')
			donefn( true )
		}
	})

	console.log('Checking _makeRequest...')
}

function checkBinding() {
	var expectedDones = 5,
		dones = 0,
		allSuccess = true,
		uname = $('meta[username]').attr('username'),
		done = function( status ) {
			dones += 1
			allSuccess = allSuccess && status
			if ( dones === expectedDones ) {
				if ( allSuccess ) {
					console.log('Good job! Your token is: ' + btoa( uname + 'hasbindingsok' ) )
				} else {
					console.error('There were errors with your API bindings')
				}
			}
		}

	checkMakeRequest( done )
	checkSearch( done )
	checkGetReport( done )
}

function checkSearchUI() {
	var $searchForm = $('#searchForm'),
		$searchResults = $('#searchResults'),
		lis

	$searchForm.find('[name="q"]').val('rolled oats')
	$searchForm.find('[name="fg"]').val('')

	$(document).ajaxComplete( function() {
		$(document).unbind('ajaxComplete')

		lis = $searchResults.find('li')

		if ( lis.length !== 2 || lis[0].children[0].innerHTML !== 'Rolls, dinner, oat bran' ) {
			console.error('Incorrect search results showing.')
			$searchForm.find('[name="q"]').val(' ')
			$searchForm.find('[name="fg"]').val('')
			$searchResults.html('')
		} else {
			$searchForm.find('[name="fg"]').val('Breakfast Cereals')

			$(document).ajaxComplete( function() {
				var uname = $('meta[username]').attr('username')

				$(document).unbind('ajaxComplete')

				lis = $searchResults.find('li')

				if ( lis.length !== 1 ||
					lis[0].children[0].innerHTML.indexOf('oats, regular and quick') === -1 ) {
					console.error('Incorrect search results showing.')
				} else {
					console.log('Fantastic work! Your token is: ' + btoa( uname + 'hassearchok' ) )
				}
				$searchForm.find('[name="q"]').val(' ')
				$searchForm.find('[name="fg"]').val('')
				$searchResults.html('')
			})

			$searchForm.submit()
		}
	})

	$searchForm.submit()
}


function checkDisplayUI() {
	var $searchForm = $('#searchForm'),
		$searchResults = $('#searchResults'),
		uname = $('meta[username]').attr('username')

	$searchForm.find('[name="q"]').val('rolled oats')
	$searchForm.find('[name="fg"]').val('Breakfast Cereals')

	$(document).ajaxComplete( function() {

		$(document).unbind('ajaxComplete')

		$(document).ajaxComplete( function() {
			if ( $('.nutrition-facts .facts-food').html().indexOf('oats, regular and quick') === -1 ) {
				console.error('Clicking on searched item does not bring up Nutrition Facts Panel')
			} else {
				$('[name="serving-sizer"]').val('1').trigger('change')
				if ( $('[data-testfixture="Sugars"]').html().indexOf('0.8') !== -1 ) {
					console.error('Changing the measurement did not update the Nutrition Facts')
				} else {
					console.log('Way to go! You built an application! Here is your token: ' + btoa( 'hasdisplayok' + uname ) )
				}
			}
		})

		$( $searchResults.find('li')[0] ).find('span:first-of-type').click()
	})

	$searchForm.submit()
}
