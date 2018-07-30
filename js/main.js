// VARIABLE DEFINITIONS
var api_version		=	2;
var api_search 		=	'api/v' + api_version + '/search',
	api_list 		=	'api/v' + api_version + '/list',
	api_edit 		=	'api/v' + api_version + '/update',
	api_add			=	'api/v' + api_version + '/add',
	api_delete		=	'api/v' + api_version + '/delete';

var display_as 		=	'table', // Display as table by default
	get_url 		=	api_list; // Location of ajax php script in variable to reduce number of similar functions
var sort_by 		=	'created_at', // Default sort method is in descending order of created_at
	sort_direction 	=	'desc';
var search_query 	=	'';
var counter_from 	=	null,
	counter_to 		=	null,
	counter_of 		=	null;
var searching 		=	false;
var multiselect 	=	$([]); // Blank array loaded as JQuery object to allow more control over multiselection (must be defined before display_items() is run or, by extension, turn_page())
var default_limit 	=	10, // Limit set over two variables to maintain default limit
	default_page 	=	1,
	default_offset 	=	0,
	limit 			=	default_limit, 
	page 			=	default_page, // Initial page to load
	offset 			=	turn_page(default_page); // This also creates the initial view
var max_page		=	null; // Maximum page that the user is allowed to turn to


////
// PAGINATION
////
/**
 * Changes the current page and loads the new view
 * @param {Number} turntopage - The page number to turn to
 */
function turn_page(turntopage){
	if(turntopage > max_page || turntopage <= 0){ // Prevent the user turning to a page above or below the limits
		return false;
	}
	page = turntopage; 
	offset = limit * (page - 1);
// 	console.log('page:' + page,'limit:'+limit, 'offset'+offset)
	display_items(); // INITIAL FUNCTION
}
/**
 * Turns to the next page
 */
function next_page(){
	if(counter_to >= counter_of || page+1 > max_page){
		return false;
	}
	// Requires +1 to get next page
	turn_page(page+1);
}
/**
 * Turns to the previous page
 */
function prev_page(){
	if(page-1 === 0){
		return false;
	}
	// Only have to pass in page as it is decremented inside the turn_page() function
	turn_page(page-1);
}

// MODAL SETUP
$('.ui.modal').modal({
	// Prevents clicking on the dimmer from closing the modal
	closable: false,
	// Prevents the default semantic ui close buttons from working by adding .btn-action so that
	// extra javacript can be run between the button click and the modal closing
	selector    : {
		close    : '.btn-action.close, .actions .btn-action.button',
		approve  : '.actions .btn-action.positive, .actions .btn-action.approve, .actions .btn-action.ok',
		deny     : '.actions .btn-action.negative, .actions .btn-action.deny, .actions .btn-action.cancel'
	},
});
// DROPDOWN SETUP
$('.ui.dropdown').dropdown();
// TOOLTIP SETUP
$('[data-tooltip]').popup();
// CHECKBOX SETUP
$('.ui.checkbox').checkbox();

////
// SEARCHING
////
// SEARCH FORM HANDLER
$("#search_form").submit(function(e){
	e.preventDefault();
	search();
});
// SEARCH BUTTON HANDLER
$("#search_icon_search").click(function(){
	if($('#search_form_input').val() !== ''){
		search();
	}
});
// SEARCH CLOSE HANDLER
$("#search_icon_close").click(function(){
	$("#search_form_input").val('');
	search();
});
// MAKE THE WHOLE MENU ITEM FOCUS ON SEARCH
$('.category.search').click(function(){
	$('#search_form_input').focus();
})
// MASTER SEARCH FUNCTION
/**
 * Sets the search variables before reloading the view to search
 */
function search(){
	limit = default_limit;
	offset = default_offset;
	page = default_page;
	search_query = $("#search_form_input").val();
	if (search_query !== "") {
		get_url = api_search;
		$("#search_icon_search").hide();
		$("#search_icon_close").show();
		searching = true;
	} else {
		get_url = api_list;
		$("#search_icon_search").show();
		$("#search_icon_close").hide();
		searching = false;
	}
	display_items();
}



////
// COUNTER
////
// UPDATE COUNTER VALUES
function update_numbers(from, to, of){
	from = parseInt(from);
	to = parseInt(to);
	of = parseInt(of);
// 	console.log('update_numbers', from, to, of)
	if(from != null){
		from++;
		$("#counter").attr('data-from', from);
		counter_from = from;
	}
	if(to != null){
		$("#counter").attr('data-to', to);
		counter_to = to;
	}
	if(of != null){
		$("#counter").attr('data-of', of);
		counter_of = of;
	}
	var disable_next = false,
		disable_prev = false;
	if(to >= of){
		to = of;
		disable_next = true;
	}
	if(from <= 1){
		disable_prev = true;
	}
	
	var counter_text = from + " - " + to + " of " + of;
	
	if(of === 0){
		counter_text = 'No results';
	}
	max_page = Math.ceil(counter_of / limit);
	
	if(from > to){
		turn_page(max_page);
	}
	
// 	console.log('disable_prev:'+disable_prev,'disable_next:'+disable_next)
	$('[data-action=page-prev]').toggleClass('disabled', disable_prev);
	$('[data-action=page-next]').toggleClass('disabled', disable_next);
	
	$("#counter").text(counter_text);
}

// MASTER FUNCTION
/**
 * The main function to request the product data from server
 */
function display_items() {
	$('[data-sortby='+sort_by+'][data-sortdirection='+sort_direction+']').addClass('selected');
	if(display_as == 'table'){
		$('[data-menufor=select]').show();
	} else {
		$('[data-menufor=select]').hide();
	}
	$.ajax({
		"url": get_url,
		"data": {
			"limit": limit,
			"offset": offset,
			"orderby": sort_by,
			"direction": sort_direction,
			"q": search_query
		},
		"beforeSend": function() {
			product_before_send();
		},
		"success": function(data) {
			product_succeed(data);
		}
	})
	multiselect_update();
}
/**
 * Is called before the ajax call is sent
 */
function product_before_send(){
	$("[data-action=refresh] i").addClass('loading');
	$("#clothing_container").empty();
}
/**
 * Is called when the ajax call succeeds
 * @param {Object} data - The data returned from the server after a successful ajax call
 */
function product_succeed(data){
// 	console.log(data);
	$("#clothing_list").empty();
	update_numbers(data.values.offset, data.values.limit+data.values.offset, data.values.total);
	if(display_as == 'list'){
		$('#clothing_container').append($('<div>', {
			class: 'ui divided link items',
			id: 'clothing_list'
		}));
	} else {
		$("#clothing_container").append($('<table>',{
			class: 'ui very basic fixed single line selectable table',
			append: [
				$("<thead>",{
					html: '<tr>\
					  <th class="one wide"></th>\
					  <th class="two wide">Name</th>\
					  <th>Description</th>\
					  <th class="two wide">Style</th>\
					  <th class="two wide">Stock</th>\
					  <th class="two wide">Price</th>\
					  <th class="two wide">Type</th>\
					</tr>'
				}),
				$("<tbody>", {
					id: 'clothing_table'
				})
			]
		}));
	}
	$.each(data.data, function(i, v) {
		if(display_as == 'list'){
			$("#clothing_list").append(clothing_list_item(v));
		} else {
			$('#clothing_table').append(clothing_table_item(v));
		}
	})
	$("[data-action=refresh] i").removeClass('loading');
}

// RETURN CLOTHING ITEM AS LIST ITEM
/**
 * Appends a product to the product container as a list item
 * @param {Object} data - The ajax returned data of the current row
 */
function clothing_list_item(data) {
	return $("<div>", {
		"id": data.id,
		"href": "#",
		"class": "item",
		"append": [
			$("<div>", {
				"class": "ui tiny image",
				"append": $('<img>', {
					'src': 'https://robohash.org/' + data.id + '?size=80x80'
				})
			}),
			$("<div>", {
				"class": "content",
				"append": [
					$('<div>', {
						class: "header",
						text: data.name
					}),
					$('<div>', {
						class: 'meta',
						append: [
							$('<span>', {
								'class': 'price',
								'text': '£' + data.price
							}),
							$('<span>', {
								'text': ' / '
							}),
							$('<span>', {
								'class': 'stock_level',
								'text': data.stock_level + ' in stock'
							}),
							$('<span>', {
								'text': ' / '
							}),
							$('<span>', {
								'class': 'type',
								'text': data.type
							}),
						]
					}),
					$('<div>', {
						'class': 'description',
						'append': $('<p>', {
							text: data.description
						})
					})
				]
			})
		],
		"click": function(e) {
			display_details(data);
		}
	})
}

// RETURN CLOTHING ITEM AS TABLE
/**
 * Appends a product to the product container as a table row
 * @param {Object} data - The ajax returned data of the current row
 */
function clothing_table_item(data){
	return $('<tr>', {
		'id': data.id,
		'click': function(e){
			if(e.target.localName != "input"){
				display_details(data);
			}
		},
		'append': [
			$('<td>', {
				'append': $("<div>", {
					'class': 'ui checkbox',
					'append': [
						$("<input>", {
							'type': 'checkbox',
							'data-multiselect': data.id,
							'click': function(e){
// 								console.log(e, this, 'checked:'+e.checked, 'checked:'+this.checked);
								
// 								console.log(multiselect);
								
							},
							'change': function(){
								if(this.checked){
									multiselect_add(data.id);
								} else {
									multiselect_remove(data.id);
								}
							}
						}).prop('checked', function(){
							return ($.inArray(data.id, multiselect) != -1)
						}),
						$("<label>",{})
					]
				}),
				'style': 'text-align: center;'
			}),
			$('<td>', {
				text: data.name
			}),
			$('<td>', {
				text: data.description
			}),
			$('<td>', {
				text: data.style
			}),
			$('<td>', {
				text: data.stock_level
			}),
			$('<td>', {
				text: "£" + data.price
			}),
			$('<td>', {
				text: data.type
			}),
		]
	})
}

// SELECTION
/**
 * Add a value to the multiselect array
 * @param {String} value - UUID of the selected product
 */
function multiselect_add(value){
	if($.inArray(value, multiselect) == -1){
		multiselect.push(value);
	}
	multiselect_update();
}
/**
 * Removes a value from the multiselect array
 * @param {String} value - UUID of the product to remove
 */
function multiselect_remove(value){
	var location = $.inArray(value, multiselect);
// 	console.log('location:'+location,'value:'+value,'multiselect:'+multiselect)
	if(location !== -1){
		multiselect.splice(location, 1);
		multiselect_update();
	}
}
/**
 * Clears the multiselect array
 */
function multiselect_clear(){
	multiselect = $([]);
	multiselect_update();
}
/**
 * Updates the variables associated with the multiselect array
 */
function multiselect_update(){
	var length = multiselect.length;
	$(".value_multiselect").text(length);
// 	console.log(length);
	var zero = length === 0;
	var maxi = length === counter_of;
	$('[data-action=multiselect-all]').toggleClass('disabled', maxi);
	$('[data-action=multiselect-none]').toggleClass('disabled', zero);
	$('[data-action=multiselect-none]').toggleClass('disabled', zero);
	$('[data-action=multiselect-clear]').toggleClass('disabled', zero);
	$('[data-action=multiselect-delete]').toggleClass('disabled', zero).toggleClass('borderless', length !== 0);
	$('#select_counter').text(length).toggle(length !== 0);
}


/**
 *	Sets the values inside the detail modal and opens it
 *	@param {Object} data - The data from the current row to be displayed
 */
function display_details(data){
	console.log(data);
	$('[data-modaldata=id]').text(data.id);
	$('[data-modaldata=name]').text(data.name);
	$('[data-modaldata=type]').text(data.type);
	$('[data-modaldata=item_image]').attr('src', 'https://robohash.org/'+data.id);
	$('[data-modalvalue=id]').val(data.id);
	$('[data-modalvalue=name]').val(data.name);
	$('[data-modalvalue=description]').val(data.description);
	$('[data-modalvalue=stock_level]').val(data.stock_level);
	$('[data-modalvalue=type]').dropdown('set selected', data.type)
	$('[data-modalvalue=style]').val(data.style);
	$('[data-modalvalue=price]').val(data.price);
	
	var created = new Date(data.created_at);
	var modified = new Date(data.modified_at);
	
	var created_string = created.getDate() + '/' + created.getMonth() + '/' + created.getFullYear() + ' ' + created.getHours() +':'+ created.getMinutes();
	var modified_string = modified.getDate() + '/' + modified.getMonth() + '/' + modified.getFullYear() + ' ' + modified.getHours() +':'+ modified.getMinutes();
	
	$('[data-modalvalue=created_at]').val(created_string);
	$('[data-modalvalue=modified_at]').val(modified_string);
	$('#edit_product_modal').modal('show');
}

////
// MAIN MENU BUTTONS
////
$(document).on('click', '[data-action=product_new]:not(.disabled)', function(){
	$('#add_product_modal input').val("");
	$('#add_product_modal textarea').val("");
	$('#add_product_modal .dropdown').dropdown('clear');
	$('#add_product_modal').modal('show');
});
$(document).on('click', '[data-action=view_list]:not(.disabled)', function(){
	display_as = 'list'
	display_items();
});
$(document).on('click', '[data-action=view_table]:not(.disabled)', function(){
	display_as = 'table'
	display_items();
});
$(document).on('click', '[data-action=export_print]:not(.disabled)', function(){
	window.print();
});
$(document).on('click', '[data-action=help]:not(.disabled)', function(){
	$('#help_modal').modal('show');
});
$(document).on('click', '[data-action=setting]:not(.disabled)', function(){
	$('#settings_modal').modal('show');
});

$(document).on('click', '[data-action=multiselect-all]:not(.disabled)', function(){
	$('input[data-multiselect]').prop('checked', true).trigger('change');
})
$(document).on('click', '[data-action=multiselect-none]:not(.disabled)', function(){
	$('input[data-multiselect]').prop('checked', false).trigger('change');
})
$(document).on('click', '[data-action=multiselect-clear]:not(.disabled)', function(){
	multiselect_clear();
	$('input[data-multiselect]').prop('checked', false).trigger('change');
})
$(document).on('click', '[data-action=multiselect-delete]:not(.disabled)', function(){
	$("#multiselect_delete_warning_modal").modal('show');
})

$(document).on('click', '[data-action=page-next]:not(.disabled)', function(){
	next_page();
});
$(document).on('click', '[data-action=page-prev]:not(.disabled)', function(){
	prev_page();
});
$(document).on('click', '[data-action=refresh]:not(.disabled)', function(){
	display_items();
});

$(document).on('click', '[data-action=delete_product]:not(.disabled)', function(){
	$('#delete_product_modal').modal('show');
});
$(document).on('click', '[data-action=batch_delete]:not(.disabled)', function(){
	$('#multiselect_delete_warning_modal').modal('hide');
	batch_delete();
});

/**
 * This listener is not used in the current version
 */
$(document).on('click', '[data-action=settings_dark_theme]', function(){
	settings_dark_theme = $('#settings_dark_theme').prop('checked');
	apply_settings_dark_theme();
})


////
// SORT MENU BUTTONS
////
$('[data-action=sort]').click(function(e){
	sort_by = $(this).attr('data-sortby');
	sort_direction = $(this).attr('data-sortdirection');
	display_items();
});

////
// FORM HANDLERS
////
$(document).on('click', '[data-submitform]', function(e){
	e.preventDefault();
	var form = $(this).attr('data-submitform');
	if(form == 'add_product'){
		form_handler_add_product(this);
	} else if (form == 'edit_product'){
		form_handler_edit_product(this);
	} else if (form == 'delete_product'){
		form_handler_delete_product(this);
	}
});
$(document).on('click', '[data-cancelform]', function(e){
	var formid = '#' + $(this).attr('data-cancelform') + '_form',
		modalid = '#' + $(this).attr('data-cancelform') + '_modal', 
		formobj = $(formid),
		modalobj = $(modalid);
	$(modalid + ' .ui.warning.message').remove();
	var form = $(this).attr('data-cancelform');
	if (form == 'delete_product'){
// 		form_close_handler_delete_product(this);
		$('#edit_product_modal').modal('show');
	} else {
		modalobj.modal('hide');
		
	}
	
});




// ADD PROCUCT FORM HANDLER
/**
 * Handles the add forms ajax calls
 * @param {Event} button_clicked - The button that was clicked to call this function
 */
function form_handler_add_product(button_clicked){
	var formid = '#' + $(button_clicked).attr('data-submitform') + '_form',
		modalid = '#' + $(button_clicked).attr('data-submitform') + '_modal', 
		formobj = $(formid),
		modalobj = $(modalid);
	var submitdata = formobj.serializeObject();
	submitdata.stock_level = parseInt(submitdata.stock_level);
	console.log(api_add,submitdata);
	$.post({
		url: api_add,
		data: submitdata,
		beforeSend: function(){
		},
		success: function(data){
			console.log(data);
			$(modalid + ' .ui.warning.message').remove();
			var message;
			if(data.success){
				message = $('<div>', {
					'class': 'ui attached success message',
					'append': [
						$('<i>', {
							'class': 'close icon',
							'click': function(){
								message.remove();
							}
						}),
						$('<i>', {'class': 'icon checkmark'}),
						$('<span>', {'text': 'Product added successfully'}),
						$('<a>', {
							'data-openproduct': 'id',
							'text': 'view'
						})
					]
				});
				setTimeout(function(){
					message.hide('fade',{},400,function(){
						message.remove();
					});
				}, 4000);
				$('#clothing_container').before(message);
				formobj[0].reset();
				modalobj.modal('hide');
				display_items();
				$(formid + ' .ui.fluid.search.dropdown').dropdown('clear');
			} else {
				message = $('<div>', {
					'class': 'ui warning message',
					'append': [
						$('<div>',{
							'class': 'header',
							'text': 'Looks like somethings wrong'
						}),
						$('<ul>', {
							'append': function(){
								var appends = [];
								$.each(data.errors, function(i,v){
									appends.push($('<li>',{
										'text': v
									}))
								});
								return appends;
							}
						})
					]
				});
				console.log(message)
// 				console.log(#add_product_modal > div.content)
				console.log($(formid + ' .content'))
				$(modalid + ' > div.content').append(message)
			}
		}
	});
}

// ADD PROCUCT FORM HANDLER
/**
 * Handles the edit forms ajax calls
 * @param {Event} button_clicked - The button that was clicked to call this function
 */
function form_handler_edit_product(button_clicked){
	var formid = '#' + $(button_clicked).attr('data-submitform') + '_form',
		modalid = '#' + $(button_clicked).attr('data-submitform') + '_modal', 
		formobj = $(formid),
		modalobj = $(modalid);
	var submitdata = formobj.serializeObject();
	submitdata.stock_level = parseInt(submitdata.stock_level);
	console.log(api_add,submitdata);
	$.post({
		url: api_edit,
		data: submitdata,
		beforeSend: function(){
		},
		success: function(data){
			console.log(data);
			$(modalid + ' .ui.warning.message').remove();
			var message;
			if(data.success){
				message = $('<div>', {
					'class': 'ui attached success message',
					'append': [
						$('<i>', {
							'class': 'close icon',
							'click': function(){
								message.remove();
							}
						}),
						$('<i>', {'class': 'icon checkmark'}),
						$('<span>', {'text': data.message}),
						$('<a>', {
							'data-openproduct': 'id',
							'text': 'view'
						})
					]
				});
				setTimeout(function(){
					message.hide('fade',{},400,function(){
						message.remove();
					});
				}, 4000);
				$('#clothing_container').before(message);
				formobj[0].reset();
				modalobj.modal('hide');
				display_items();
				$(formid + ' .ui.fluid.search.dropdown').dropdown('clear');
			} else {
				message = $('<div>', {
					'class': 'ui warning message',
					'append': [
						$('<div>',{
							'class': 'header',
							'text': 'Looks like somethings wrong'
						}),
						$('<ul>', {
							'append': function(){
								var appends = [];
								$.each(data.errors, function(i,v){
									appends.push($('<li>',{
										'text': v
									}))
								});
								return appends;
							}
						})
					]
				});
				console.log(message)
// 				console.log(#add_product_modal > div.content)
// 				console.log($(formid + ' .content'))
				$(modalid + ' > div.content > div.description').append(message)
			}
		}
	});
}

// ADD PROCUCT FORM HANDLER
/**
 * Handles the delete forms ajax calls
 * @param {Event} button_clicked - The button that was clicked to call this function
 */
function form_handler_delete_product(button_clicked){
	var formid = '#' + $(button_clicked).attr('data-submitform') + '_form',
		modalid = '#' + $(button_clicked).attr('data-submitform') + '_modal', 
		formobj = $(formid),
		modalobj = $(modalid);
	var submitdata = formobj.serializeObject();
	console.log(api_delete,submitdata);
	$.ajax({
		url: api_delete,
		data: submitdata,
		beforeSend: function(){
		},
		success: function(data){
			console.log(data);
			$(modalid + ' .ui.warning.message').remove();
			var message;
			if(data.success){
				message = $('<div>', {
					'class': 'ui attached success message',
					'append': [
						$('<i>', {
							'class': 'close icon',
							'click': function(){
								message.remove();
							}
						}),
						$('<i>', {'class': 'icon checkmark'}),
						$('<span>', {'text': data.message}),
						$('<a>', {
							'data-openproduct': 'id',
							'text': 'view'
						})
					]
				});
				setTimeout(function(){
					message.hide('fade',{},400,function(){
						message.remove();
					});
				}, 4000);
				$('#clothing_container').before(message);
				formobj[0].reset();
				modalobj.modal('hide');
				display_items();
				$(formid + ' .ui.fluid.search.dropdown').dropdown('clear');
			} else {
				message = $('<div>', {
					'class': 'ui warning message',
					'append': [
						$('<div>',{
							'class': 'header',
							'text': 'Looks like somethings wrong'
						}),
						$('<ul>', {
							'append': function(){
								var appends = [];
								$.each(data.errors, function(i,v){
									appends.push($('<li>',{
										'text': v
									}))
								});
								return appends;
							}
						})
					]
				});
				console.log(message)
// 				console.log(#add_product_modal > div.content)
// 				console.log($(formid + ' .content'))
				$(modalid + ' > div.content > div.description').append(message)
			}
		}
	});
}

/**
 * Deletes all products in the multiselect array
 */
function batch_delete(){
	
	$.each(multiselect, function(i,v){
		
		$.ajax({
			url: api_delete,
			data: {
				'id': v
			},
			success: function(){
				multiselect_remove(v);
			}
		});
	})
// 	multiselect_update();
	if(multiselect.length === 0){
		message = $('<div>', {
			'class': 'ui attached success message',
			'append': [
				$('<i>', {
					'class': 'close icon',
					'click': function(){
						message.remove();
					}
				}),
				$('<i>', {'class': 'icon checkmark'}),
				$('<span>', {'text': 'Products deleted successfully'}),
				$('<a>', {
					'data-openproduct': 'id',
					'text': 'view'
				})
			]
		});
		setTimeout(function(){
			message.hide('fade',{},400,function(){
				message.remove();
			});
		}, 4000);
		$('#clothing_container').before(message);	
	}
	display_items();
	
}








