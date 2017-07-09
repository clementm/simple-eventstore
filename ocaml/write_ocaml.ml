open Printf
open Unix
open String
open Str

let file = concat "" [Sys.argv.(1); ".dblog"];;
let logFile = concat "" [Sys.argv.(1); ".id"; ".dblog"];;

let append_log logId payload = 
  let oc = open_out_gen [Open_append; Open_creat] 0o664 file in
  fprintf oc "%d %s\n" logId payload;
  close_out oc
;;

let read_logId () = 
  try
    let ic = open_in logFile in
    let logId = int_of_string (input_line ic) in
    close_in ic; logId
  with e -> 0
;;

let update_logId () =
  let logId = (read_logId ()) + 1 in
  let oc = open_out logFile in
  fprintf oc "%d\n" logId;
  close_out oc;
  logId
;;



let () = append_log (update_logId ()) Sys.argv.(2);;