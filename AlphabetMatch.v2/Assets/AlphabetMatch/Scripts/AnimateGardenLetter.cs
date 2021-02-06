using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class AnimateGardenLetter : MonoBehaviour
{
   public int AnimateFlag;
   float velocity;
   float yPos;
   
   bool waitFlag;
   float timer;
   float waitTime;
   
   void Start(){
	   ResetAnimate();
   }
   
   public void ResetAnimate(){
	   timer = 0f;
	   waitTime = 0.15f;
	   waitFlag = false;
	   AnimateFlag = 0;
	   velocity = -100f;
	   yPos = 0f;
   }
   
    // Update is called once per frame
    void Update()
    {
        if (AnimateFlag>0){
			if (waitFlag){
				timer += Time.deltaTime;
				if (timer>waitTime){
					timer = 0f;
					waitFlag = false;
				}
			}else{
				yPos += Time.deltaTime * velocity;
				/*
				if (yPos>1){
					yPos = 0f;
					velocity *=-1;
					waitFlag = true;
					if (AnimateFlag==2){
						timer = 0f;
						waitFlag = false;
						AnimateFlag = 0;
					}
				}*/
				
				if (yPos<-70){
					yPos = -70f;
					//velocity *=-1;
					timer = 0f;
					waitFlag = false;
					AnimateFlag = 0;
				}
				GetComponent<RectTransform>().localPosition = new Vector3(0f,yPos,0f);
			}
		}
    }
}
