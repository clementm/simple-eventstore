open Printf
open Unix
open String
open Str

let extract_logId str = int_of_string (string_before str (search_forward (regexp " ") str 0));;

let read_all ic = 
  try
    while true do
      let line = input_line ic in print_endline line
    done
  with e -> ();
;;

let rec search ic date a b div =
  if b <= a then raise Not_found else
  let mid = ((div-1)*a+b)/div in seek_in ic mid;
  (* skip content until newline *)
  if mid > 0 then ignore (input_line ic);

  let position = pos_in ic in
  if position >= b then
    if mid == a then 
      try 
        let line = input_line ic in
        let rDate = extract_logId line in
        if rDate == date then rDate else raise Not_found 
      with End_of_file -> raise Not_found;
    else search ic date a b (div*2)
  else
  let line = input_line ic in
  let rDate = extract_logId line in
  if rDate == date then (read_all ic; date) else
  if date < rDate then search ic date 0 position 2 else
  search ic date (mid + (length line)) b 2
;;
  
let () =
  let file = concat "" [Sys.argv.(1); ".dblog"] in
  let logId = int_of_string Sys.argv.(2) in
  let fileSize = (Unix.stat file).st_size in
  let ic = open_in file in
  ignore (search ic logId 0 fileSize 2);
;;
