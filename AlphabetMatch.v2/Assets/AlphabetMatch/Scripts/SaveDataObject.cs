using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SaveDataObject : MonoBehaviour
{
    public int[] lowlevelPlayed;
	public int[] medlevelPlayed;
	public int[] highlevelPlayed;
	
	public int[] lowlevelMiss;
	public int[] medlevelMiss;
	public int[] highlevelMiss;
	
	public int[] lowlevelTime;
	public int[] medlevelTime;
	public int[] highlevelTime;
	
	public int levelSum;
	public int missSum;
	public int timeSum;
	
	public int lowlevelSum;
	public int medlevelSum;
	public int highlevelSum;
	
	public int lowmissSum;
	public int medmissSum;
	public int highmissSum;
	
	public int lowtimeSum;
	public int medtimeSum;
	public int hightimeSum;
	
	public void Init(){
		//
		lowlevelPlayed = new int[]{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};
		medlevelPlayed = new int[]{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};
		highlevelPlayed = new int[]{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};
		//
		lowlevelMiss = new int[]{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};
		medlevelMiss = new int[]{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};
		highlevelMiss = new int[]{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};
		//
		lowlevelTime = new int[]{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};
		medlevelTime = new int[]{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};
		highlevelTime = new int[]{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};
		//
	}
	
	public void InitSum(){
		lowlevelSum = 0;
		medlevelSum = 0;
		highlevelSum = 0;
		//
		lowmissSum = 0;
		medmissSum = 0;
		highmissSum = 0;
		//
		lowtimeSum = 0;
		medtimeSum = 0;
		hightimeSum = 0;
		//
		levelSum = 0;
		missSum = 0;
		timeSum = 0;
	}
	
	public void TotalSum(){
		for (int i=0; i<lowlevelPlayed.Length; i++){
			lowlevelSum += lowlevelPlayed[i];
			levelSum += lowlevelPlayed[i];
			medlevelSum += medlevelPlayed[i];
			levelSum += medlevelPlayed[i];
			highlevelSum += highlevelPlayed[i];
			levelSum += highlevelPlayed[i];
			//
			lowmissSum += lowlevelMiss[i];
			missSum += lowlevelMiss[i];
			medmissSum += medlevelMiss[i];
			missSum += medlevelMiss[i];
			highmissSum += highlevelMiss[i];
			missSum += highlevelMiss[i];
			//
			lowtimeSum += lowlevelTime[i];
			timeSum += lowlevelTime[i];
			medtimeSum += medlevelTime[i];
			timeSum += medlevelTime[i];
			hightimeSum += highlevelTime[i];
			timeSum += highlevelTime[i];
		}
	}
	
	public void LevelSum(int _letterNum){
		levelSum = 0;
		missSum = 0;
		timeSum = 0;
		//
		for (int i=0;i<26;i++){
			Debug.Log("MP" + medlevelPlayed[i]);
		}
		levelSum += lowlevelPlayed[_letterNum];
		levelSum += medlevelPlayed[_letterNum];
		levelSum += highlevelPlayed[_letterNum];
		//
		missSum += lowlevelMiss[_letterNum];
		missSum += medlevelMiss[_letterNum];
		missSum += highlevelMiss[_letterNum];
		//
		timeSum += lowlevelTime[_letterNum];
		timeSum += medlevelTime[_letterNum];
		timeSum += highlevelTime[_letterNum];
	}
	
}
