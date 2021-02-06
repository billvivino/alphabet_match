using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[System.Serializable]
public class Save 
{
	// -- 27 items A-Z, All
	public List<int> lowlevelPlayed = new List<int>();
	public List<int> medlevelPlayed = new List<int>();
	public List<int> highlevelPlayed = new List<int>();
	// -- 27 items 
	public List<int> lowlevelMiss = new List<int>();
	public List<int> medlevelMiss = new List<int>();
	public List<int> highlevelMiss = new List<int>();
	// -- 27 items 
	public List<int> lowlevelTime= new List<int>();
	public List<int> medlevelTime = new List<int>();
	public List<int> highlevelTime = new List<int>();
}
