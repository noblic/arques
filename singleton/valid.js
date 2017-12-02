/*
	Arques Engine
	Author: Andy Remi (andy@noblic.com) 

  Copyrightⓒ Noblic, Inc. All rights reserved.
  Since 2016 
  License: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
*/

/**
 * @namespace valid
 * @memberOf ar
 * @desc Validation singleton to check the validation of a string.
 */

ar.valid = function() {
	var This = this;
}

ar.valid.country = function(str) {
	var isValid = str == '' ? false : true;
	return isValid;
}

/**
 * @func email
 * @memberOf ar.valid
 * @desc Tells if the specified string is valid email format.
 * @param {string} str - Email string.
 * @return {boolean}
 */

ar.valid.email = function(str) {
	var pattern = new RegExp(/^([A-Za-z0-9\-\_\.]+@([A-Za-z0-9\-\_\.]+\.)+[A-Za-z0-9\-\_\.]{2,4})?$/);
	var isValid = str && pattern.test(str) && str.length >= 6 ? true : false;

	return isValid;
}

/**
 * @func domain
 * @memberOf ar.valid
 * @desc Tells if the specified string is valid domain format.
 * @param {string} str - Domain string.
 * @return {boolean}
 */

ar.valid.domain = function(str) {
	var isValid = /[A-Za-z0-9\-\_]+$/.test(str) == 0 ? false : true;
	return isValid;
}

/**
 * @func password
 * @memberOf ar.valid
 * @desc Tells if the specified string is valid password format. It must be at least 8 characters and must have at least one upper alphabet, one lower alphabet, and one number.
 * @param {string} str - Password string.
 * @return {boolean}
 */

ar.valid.password = function(str) {
	var err = 0;

	if (str.length < 8)
		err++;

	var regx = /[A-Za-z0-9\`\~\!\@\#\$\^\*\(\)\:\;\"\'\<\>\?\,\.\/\-\_\=\+\|]*$/i;

	if (!regx.test(str))
		err++;

	err += (str.search(/[a-z]/) == -1 ? 1 : 0);
	err += (str.search(/[A-Z]/) == -1 ? 1 : 0);
	err += (str.search(/[0-9]/) == -1 ? 1 : 0);

	return err > 0 ? false : true;
}

/**
 * @func phone
 * @memberOf ar.valid
 * @desc Tells if the specified string is valid international phone number format. 
 * @param {string} str - Phone number string.
 * @return {boolean}
 */

ar.valid.phone = function(str) {
	var err = /^\+[0-9]+\-[0-9]+\-[0-9]+\-[0-9]+$/.test(str) == 0 ? 1 : 0;

	if (str.length < 11)
		err++;

	return err > 0 ? false : true;
}

/**
 * @func zip
 * @memberOf ar.valid
 * @desc Tells if the specified string is valid the US zip code(5) format. 
 * @param {string} str - Zip code string.
 * @return {boolean}
 */

ar.valid.zip = function(str) {
	var isValid = /[0-9\-]+$/.test(str) == 0 || str.length < 5 ? false : true;
	return isValid;
}

ar.valid.text = function(str) {
	var isValid = str.length == 0 ? false : true;
	return isValid;
}

/**
 * @func uuid
 * @memberOf ar.valid
 * @desc Tells if the specified string is valid uuid format. 
 * @param {string} str - Uuid string.
 * @return {boolean}
 */

ar.valid.uuid = function(uuid) {
	// http://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid
	return uuid && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(uuid);
}
