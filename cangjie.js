var center_boarde = document.getElementById("center_boarde");
var whole_boarde = document.getElementById("whole_boarde");
var welcome = document.getElementById("welcome");
var input_area = document.getElementById("input_area");
var cc_code = document.getElementById("cc_code");
var select_idiom = document.getElementById("select_idiom");
var input_mode_button = document.getElementById("input_mode_button");
var help = document.getElementById("help");

//to initial the textarea's width and height
input_area.style.width = "400px";
input_area.style.height = "200px";

//read the cin file
var yahooCJ_e = [];
var yahooCJ_c = [];

//the var below is must remember to be reset
var input_letter = "";
var cin_point = 0;
var idiom_count = 0;
var page_point = 0;

//saveral mode switch
var input_mode = true; //chinese or english
var space_mode = false; //space manner when no cc matched
var punc_mode = false; //,.to two width
var font_mode = false; //TW-Sung or HanaMin
var search_mode = false; //search the e cha from cc

//search the e cha from cc
var e_storage = []; //store the matched e-cha
var e_point = 0; //which e-cha is to be showed

//is used to cancel the forward timeout
var vision_timeout;

//if only shift down, the input_mode should be changed
var key_down_count = 0;
var key_up_count = 0;

//read cin file and set focus
function body_onload() {
	r_cookie();
	input_area.focus();
	read_cin();
	vision_inform("請稍候...", "正在導入倉頡碼表", 0);
}

function key_down(evn) {
	key_down_count += evn.keyCode;
	if (16 == evn.keyCode) {
		key_down_count = evn.keyCode;
	}
	if (evn.ctrlKey) {
		//{'}switch space mode
		if (222 == evn.keyCode) {
			if (space_mode) {
				space_mode = false;
				vision_inform("空格模式", "空碼無效", 1000);
			}
			else {
				space_mode = true;
				vision_inform("空格模式", "空碼清空", 1000);
			}
		}
		//{,}switch punctuation mode
		else if (188 == evn.keyCode) {
			if (punc_mode) {
				punc_mode = false;
				vision_inform("切換標點", "英文標點", 1000);
			}
			else {
				punc_mode = true;
				vision_inform("切換標點", "中文標點", 1000);
			}
		}
		//{.}switch font
		else if (190 == evn.keyCode) {
			if (font_mode) {
				font_mode = false;
				change_font("font_TWSung");
				vision_inform("切換字體", "TW-Sung", 1000);
			}
			else {
				font_mode = true;
				change_font("font_HanaMin");
				vision_inform("切換字體", "HanaMin", 1000);
			}
		}
		//{Ctrl}+{12345}ajust input_area's width and height
		else if (53 == evn.keyCode) {
			input_area.style.width = "400px";
			input_area.style.height = "200px";
			vision_inform("原始大小", input_area.style.width + "," + input_area.style.height, 1000);
		}
		else if (49 == evn.keyCode || 51 == evn.keyCode) {
			if (parseInt(input_area.style.width) + 40 * (50 - evn.keyCode) < 400) {
				input_area.style.width = "400px";
				vision_inform("最小寬度", input_area.style.width + "," + input_area.style.height, 1000);
			}
			else {
				input_area.style.width = String(parseInt(input_area.style.width) + 40 * (50 - evn.keyCode)) + "px";
				vision_inform("寬度" + (50 - evn.keyCode > 0 ? "+" : "-") + "40px", input_area.style.width + "," + input_area.style.height, 1000);
			}
		}
		else if (50 == evn.keyCode || 52 == evn.keyCode) {
			if (parseInt(input_area.style.height) + 40 * (51 - evn.keyCode) < 200) {
				input_area.style.height = "200px";
				vision_inform("最小高度", input_area.style.width + "," + input_area.style.height, 1000);
			}
			else {
				input_area.style.height = String(parseInt(input_area.style.height) + 40 * (51 - evn.keyCode)) + "px";
				vision_inform("高度" + (51 - evn.keyCode > 0 ? "+" : "-") + "40px", input_area.style.width + "," + input_area.style.height, 1000);
			}
		}
		//{Ctrl}+{6789} ajust input_area's location
		else if (54 == evn.keyCode) {
			whole_board.style.marginTop = "0px";
			vision_inform("位置調整", "上移頂端", 1000);
		}
		else if (55 == evn.keyCode) {
			center_board.style.left = "0%";
			whole_board.style.right = "0%";
			vision_inform("位置調整", "移至左端", 1000);
		}
		else if (56 == evn.keyCode) {
			whole_board.style.marginTop = "40px";
			vision_inform("位置調整", "下移原位", 1000);
		}
		else if (57 == evn.keyCode) {
			center_board.style.left = "50%";
			whole_board.style.right = "50%";
			vision_inform("位置調整", "保持居中", 1000);
		}
		//search e frome cc
		else if (!input_area.readOnly && (59 == evn.keyCode || 186 == evn.keyCode)) {
			search_mode = true;
			input_letter = "";
			idiom_count = 0;
			page_point = 0;

			e_storage = [];
			e_point = 0;

			vision_inform("", "<-輸入漢字查詢", 0);
			input_area.disabled = true;
			input_mode_button.disabled = true;
			cc_code.readOnly = false;
			cc_code.focus();
		}
		else {
			return true;
		}
		return false;
	}
	if (input_mode || evn.shiftKey && input_letter == "" ||  evn.altKey) {
		return true;
	}
	//letters
	if (evn.keyCode >= 65 && evn.keyCode <= 90) {
		if (input_letter.length < 5) {
			input_letter += (String.fromCharCode(evn.keyCode)).toLowerCase();
			cin_idiom();
			vision_select();
		}
		return false;
	}
	//Space
	else if (evn.keyCode == 32 && input_letter != "") {
		if (idiom_count > 0) {
			insert_cc(yahooCJ_c[cin_point + 4 * page_point]);
			input_letter = "";
			idiom_count = 0;
			page_point = 0;
			vision_select();
		}
		else if (space_mode) {
			input_letter = "";
			idiom_count = 0;
			page_point = 0;
			vision_select();
		}
		return false;
	}
	//select 2,3,4
	else if (evn.keyCode >= 50 && evn.keyCode <= 52 && input_letter != "") {
		if (idiom_count > evn.keyCode - 49) {
			insert_cc(yahooCJ_c[cin_point + 4 * page_point + evn.keyCode - 49]);
			input_letter = "";
			idiom_count = 0;
			page_point = 0;
			vision_select();
		}
		return false;
	}
	//page plus
	else if ((evn.keyCode == 34 || evn.keyCode == 53) && input_letter != "") {
		if (idiom_count > 4 * (page_point + 1)) {
			page_point += 1;
			vision_select();
		}
		return false;
	}
	//page reduce
	else if ((evn.keyCode == 33 || evn.keyCode == 49) && input_letter != "") {
		if (0 < page_point) {
			page_point -= 1;
			vision_select();
		}
		return false;
	}
	//Esc or Enter
	else if ((evn.keyCode == 27 || evn.keyCode == 13) && input_letter != "") {
		input_letter = "";
		idiom_count = 0;
		page_point = 0;
		vision_select();
		return false;
	}
	//Backspace
	else if (evn.keyCode == 8 && input_letter != "") {
		input_letter = input_letter.substr(0, input_letter.length - 1);
		cin_idiom();
		vision_select();
		return false;
	}
	//disable punctuation when cc would be inputed
	else if (input_letter != "" && ((evn.keyCode >= 186 && evn.keyCode <= 192) || (evn.keyCode >= 219 && evn.keyCode <= 222) || (evn.keyCode >= 54 && evn.keyCode <= 57) || evn.keyCode == 48 || evn.keyCode == 59 || evn.keyCode == 61 || evn.keyCode == 173)) {
		return false;
	}
	//Punctuation {,.}
	else if (input_letter == "" && punc_mode && (evn.keyCode == 188 || evn.keyCode == 190)) {
		insert_cc(yahooCJ_c[match_cin("zxa" + String.fromCharCode(evn.keyCode - 122).toLowerCase())]);
		return false;
	}
	return true;
}

function key_up(evn) {
	key_up_count += evn.keyCode;
	//key Shift to switch input cc or e
	if (key_down_count == 16 && key_up_count == 16 && yahooCJ_c.length > 0) {
		change_input_mode();
	}
	if(key_down_count <= key_up_count) {
		key_down_count = 0;
		key_up_count = 0;
	}
	return;
}

function search_input(evn) {
	//ctrl function
	if (evn.ctrlKey) {
		//switch to input function
		if (59 == evn.keyCode || 186 == evn.keyCode) {
			search_mode = false;
			e_storage = [];
			e_point = 0;
			vision_inform("", "", 0);
			input_area.disabled = false;
			input_mode_button.disabled = false;
			cc_code.readOnly = true;
			input_area.focus();
			return false;
		}
		//switch font
		else if (190 == evn.keyCode) {
			if (font_mode) {
				font_mode = false;
				change_font("font_TWSung");
			}
			else {
				font_mode = true;
				change_font("font_HanaMin");
			}
			return false;
		}
	}
	//e_point plus
	if ((evn.keyCode == 34 || evn.keyCode == 53) && e_storage.length > 0) {
		if (e_storage.length > e_point + 1) {
			e_point += 1;
			if (e_storage.length > e_point + 2) {
				vision_inform(cc_code.value, e_storage[e_point] + "    < >", 0);
			}
			else {
				vision_inform(cc_code.value, e_storage[e_point] + "    <  ", 0);
			}
		}
		return false;
	}
	//e_point reduce
	else if ((evn.keyCode == 33 || evn.keyCode == 49) && e_storage.length > 0) {
		if (e_point > 0) {
			e_point -= 1;
			if (e_point > 0) {
				vision_inform(cc_code.value, e_storage[e_point] + "    < >", 0);
			}
			else {
				vision_inform(cc_code.value, e_storage[e_point] + "      >", 0);
			}
		}
		return false;
	}
	else if (evn.keyCode == 13 && cc_code.value.length > 0) {
		cc_e();
	}
	return true;
}

function change_font(the_font) {
	welcome.className = the_font;
	input_area.className = the_font;
	cc_code.className = the_font;
	select_idiom.className = the_font;
	input_mode_button.className = the_font;
	help.className = the_font;
	return;
}

function change_input_mode() {
	if (input_mode) {
		input_mode = false;
		input_mode_button.value = "倉頡";
	}
	else {
		input_mode = true;
		input_mode_button.value = "EN";
	}
	key_down_count = 0;
	key_up_count = 0;
	input_letter = "";
	idiom_count = 0;
	page_point = 0;
	vision_select();
	input_area.focus();
	vision_inform("切換中/英", input_mode_button.value, 1000);
	return;
}

function match_e(search_cc) {
	var search_point = 0;
	var single_letter = "";
	var cc_carriage = "";
	var letter_point = 0;
	while (yahooCJ_c.length > search_point) {
		if (yahooCJ_c[search_point] == search_cc) {
			cc_carriage = "";
			letter_point = 0;
			while (yahooCJ_e[search_point].length > letter_point) {
				single_letter = yahooCJ_e[search_point].substr(letter_point,1);
				if ("x" == single_letter) {
					single_letter = "toog";
				}
				else if ("z" == single_letter) {
					single_letter = "hjwg";
				}
				cc_carriage += yahooCJ_c[match_cin(single_letter)];
				letter_point += 1;
			}
			while (5 > letter_point) {
				cc_carriage += yahooCJ_c[match_cin("zxaa")];
				letter_point += 1;
			}
			e_storage.push(cc_carriage);
		}
		search_point += 1;
	}
	return;
}

function match_cin(search_code) {
	var start_point = 0;
	var end_point = yahooCJ_e.length;
	var search_point = Math.floor((start_point + end_point) / 2);

	if ("" == search_code) {
		return yahooCJ_e.length;
	}
	while (search_point > start_point) {
		if (yahooCJ_e[search_point] > search_code) {
			end_point = search_point;
			search_point = Math.floor((start_point + end_point) / 2);
		}
		else if (yahooCJ_e[search_point] < search_code) {
			start_point = search_point;
			search_point = Math.floor((start_point + end_point) / 2);
		}
		else {
			while (yahooCJ_e[search_point] == yahooCJ_e[search_point - 1]) {
				search_point -= 1;
			}
			return search_point;
		}
	}
	if (0 == search_point) {
		return 0;
	}
	else {
		return yahooCJ_e.length;
	}
}

function cc_e() {
	e_storage = [];
	e_point = 0;
	if (cc_code.value == "") {
		vision_inform("", "<-請輸入漢字查詢", 0);
	}
	else {
		match_e(cc_code.value);
 		if (e_storage.length > 0) {
 			if (e_storage.length > 1) {
				vision_inform(cc_code.value, e_storage[e_point] + "      >", 0);
 			}
 			else {
				vision_inform(cc_code.value, e_storage[e_point] + "       ", 0);
 			}
		}
		else {
			vision_inform(cc_code.value, "？查無此字", 0);
		}
	}
	return;
}

function cin_idiom() {
	cin_point = 0;
	idiom_count = 0;
	cin_point = match_cin(input_letter);
	if (yahooCJ_e.length > cin_point) {
		idiom_count = 1;
		if (yahooCJ_e.length > cin_point + 1) {
			while (yahooCJ_e[cin_point] == yahooCJ_e[cin_point + idiom_count]) {
				idiom_count += 1;
			}
		}
	}
	return;
}

function w_cookie () {
	var d = new Date();
    d.setTime(d.getTime() + (90*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = "input_area_value=" + encodeURIComponent(input_area.value) + ";" + expires;
	return;
}

function r_cookie () {
    var en_cookie = document.cookie.split(';')[0];
	en_cookie = en_cookie.substring(17, en_cookie.length);
	input_area.value = decodeURIComponent(en_cookie);
	return;
}

function vision_inform(cc_carriage, select_carriage, timeout) {
	cc_code.value = cc_carriage;
	select_idiom.value = select_carriage;
	if (timeout > 0) {
		clearTimeout(vision_timeout);
		vision_timeout = setTimeout(vision_select, timeout);
	}
	return;
}

function vision_select() {
	var single_letter = "";
	var letter_point = 0;
	var cc_carriage = "";
	var select_point = 0;
	var select_carriage = "";
	while (input_letter.length > letter_point) {
		single_letter = input_letter.substr(letter_point,1);
		if ("x" == single_letter) {
			single_letter = "toog";
		}
		else if ("z" == single_letter) {
			single_letter = "hjwg";
		}
		cc_carriage += yahooCJ_c[match_cin(single_letter)];
		letter_point += 1;
	}
	cc_code.value = cc_carriage;
	if (idiom_count > 0) {
		while (4 > select_point) {
			if (idiom_count - page_point * 4 > select_point) {
				select_carriage += yahooCJ_c[cin_point + select_point + page_point * 4];
			}
			else {
				select_carriage += yahooCJ_c[match_cin("zxaa")];
			}
				if (3 > select_point) {
					select_carriage += yahooCJ_c[match_cin("zxaa")];
				}
			select_point += 1;
		}
		if (page_point > 0) {
			select_carriage += " <";
		}
		else {
			select_carriage += "  ";
		}
		if (idiom_count > (page_point + 1) * 4) {
			select_carriage += ">";
		}
	}
	select_idiom.value = select_carriage;
	return;
}

/* read the cin file */
function read_cin() {
	var cin_file;
	var cin_n = [];
	var cin_n_point = 0;
	if (window.XMLHttpRequest) {
		cin_file = new XMLHttpRequest();
		cin_file.onreadystatechange = function() {
			//if (cin_file.readyState == 4 && cin_file.status == 200)
			if (cin_file.readyState == 4)
			{
				cin_n = cin_file.responseText.split("\n");
				while (cin_n.length - 1 > cin_n_point) {
					yahooCJ_e[cin_n_point] = cin_n[cin_n_point].split("\t")[0];
					yahooCJ_c[cin_n_point] = cin_n[cin_n_point].split("\t")[1];
					cin_n_point += 1;
				}
				input_mode_button.disabled = false;
				change_input_mode();
				vision_inform("開始使用", "", 1000);
			}
		}
		cin_file.open("GET","./yahooCJ.cin",true);
		cin_file.send();
	}
	return;
}

function insert_cc(myValue) {
	//IE support
	if (document.selection) {
		input_area.focus();
		sel = document.selection.createRange();
		sel.text = myValue;
		sel.select();
	}
	//MOZILLA/NETSCAPE support
	else if (input_area.selectionStart || input_area.selectionStart == '0') {
		var startPos = input_area.selectionStart;
		var endPos = input_area.selectionEnd;
		// save scrollTop before insert chinese Cha
		var restoreTop = input_area.scrollTop;
		input_area.value = input_area.value.substring(0, startPos) + myValue + input_area.value.substring(endPos, input_area.value.length);
		if (restoreTop > 0) {
			input_area.scrollTop = restoreTop;
		}
		input_area.focus();
		input_area.selectionStart = startPos + myValue.length;
		input_area.selectionEnd = startPos + myValue.length;
	} else {
		input_area.value += myValue;
		input_area.focus();
	}
	w_cookie();//write the textarea'value when cc input
	return;
}
