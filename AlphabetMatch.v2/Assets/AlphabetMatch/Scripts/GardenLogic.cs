using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GardenLogic : MonoBehaviour
{
    public GameLogic gameLogicObj;
	public GameObject[] GardenLetters;
	
	public int LetterCounter;
	public int AnimateCounter;
	public int AnimateStop;
	
	public bool AnimateFlag;
	public int StopCounter;
	public int randomLetterIndex;
	
	public GameObject[] chars;
	
	float timer;
	float waitTime;
	
	// Start is called before the first frame update
    void Start()
    {
	    ResetGarden();
    }
	
	public void SelectRandomLetters(){
		randomLetterIndex = Random.Range(0,23);
		AnimateStop = 51 + randomLetterIndex;
	}
	
	public void ResetVars(){
		timer = 0f;
		waitTime = 0.2f;
		LetterCounter = 0;
		AnimateCounter = 0;
		SelectRandomLetters();
		StopCounter = 0;
		AnimateFlag = false;
	}
	
	public void SelectChars(int _char){
		for (int i=0;i<chars.Length;i++){
			if (i==_char){
				chars[i].SetActive(true);
			}else{
				chars[i].SetActive(false);
			}
		}
	}
	
	public void ResetGarden(){
		ResetVars();
		for (int i=0;i<GardenLetters.Length;i++){
			GardenLetters[i].GetComponent<RectTransform>().localPosition = new Vector3(0f,-70f,0f);
			GardenLetters[i].GetComponent<AnimateGardenLetter>().ResetAnimate();
		}
	}

    // Update is called once per frame
    void Update()
    {
        if (AnimateFlag){
			timer += Time.deltaTime;
			if (timer > waitTime){
				if (AnimateCounter>AnimateStop){
					GardenLetters[LetterCounter].GetComponent<AnimateGardenLetter>().AnimateFlag = 2;
					StopCounter++;
					if (StopCounter>2){
						AnimateFlag = false;
						gameLogicObj.SetCurrentLetter(randomLetterIndex);
					}
				}else{
					GardenLetters[LetterCounter].GetComponent<AnimateGardenLetter>().AnimateFlag = 1;
				}
				timer -= waitTime;
				LetterCounter++;
				AnimateCounter++;
				if (LetterCounter>25){
					LetterCounter = 0;
				}
			}
		}
    }
}
