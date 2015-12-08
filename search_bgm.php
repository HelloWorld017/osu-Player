<?php
const INFO_URL = "http://bloodcat.com/osu/?";

echo file_get_contents(INFO_URL . $_SERVER['QUERY_STRING']);
