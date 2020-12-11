using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GameLogic : MonoBehaviour
{
    public GardenLogic gardenLogicObj;
	public LetterCharacterAnimate LetterCharacterObj;
	
	public string gameState;
	public string characterSelection;
	public int levelNumber;
	
	public GameObject StartScreen;
	public GameObject CharacterScreen;
	public GameObject LevelScreen;
	public GameObject GardenScreen;
	public GameObject PlayScreen;
	public GameObject AnimateScreen;
	
	// Start is called before the first frame update
    void Start()
    {
        gameState = "StartGame";
		UpdateScreenDisplay();
		
    }
	
	public void SetGameState(string _state){
		gameState = _state;
	}
	
	public void StartGame(){
		gameState = "CharacterSelect";
	}
	
	public void PlayGame(){
		StopGardenAnimate();
		gameState = "PlayGame";
	}

	public void ChooseCharacter(string _name){
		characterSelection = _name;
		if (_name=="boy"){
			gardenLogicObj.SelectChars(0);
		}
		if (_name=="girl"){
			gardenLogicObj.SelectChars(1);
		}
		if (_name=="dog"){
			gardenLogicObj.SelectChars(2);
		}
		if (_name=="cat"){
			gardenLogicObj.SelectChars(3);
		}
		//
		gameState = "LevelSelect";
	}
	
	public void ChooseLevel(int _level){
		levelNumber = _level;
		gameState = "AnimateGarden";
	}

	public void ClearGlows(){
		GameObject[] gos;
        gos = GameObject.FindGameObjectsWithTag("Glow");
		foreach (GameObject go in gos)
        {
            go.SetActive(false);
        }
	}
	
	public void UpdateScreenDisplay(){
		HideScreens();
		switch(gameState){
			case "StartGame":
			StartScreen.SetActive(true);
			break;
			case "CharacterSelect":
			CharacterScreen.SetActive(true);
			break;
			case "LevelSelect":
			LevelScreen.SetActive(true);
			break;
			case "AnimateGarden":
			GardenScreen.SetActive(true);
			break;
			case "PlayGame":
			PlayScreen.SetActive(true);
			break;
			case "AnimationBreak":
			AnimateScreen.SetActive(true);
			break;
		}
	}
	
	void HideScreens(){
		ClearGlows();
		StartScreen.SetActive(false);
	    CharacterScreen.SetActive(false);
		LevelScreen.SetActive(false);
		GardenScreen.SetActive(false);
		PlayScreen.SetActive(false);
		AnimateScreen.SetActive(false);
	}
	
	public void StopLevelSelect(){
		gameState = "CharacterSelect";
	}
	
	public void StopGardenAnimate(){
		gardenLogicObj.AnimateFlag = false;
		gardenLogicObj.ResetGarden();
		gameState = "LevelSelect";
	}
	
	public void StopPlayGame(){
		StopGardenAnimate();
		gameState = "AnimateGarden";
	}
	
	public void StopAnimationBreak(){
		gameState = "AnimateGarden";
	}
	
    // Update is called once per frame
    void Update()
    {
        switch(gameState){
			case "StartGame":
			UpdateScreenDisplay();
			gameState = "StartGameWait";
			break;
			case "CharacterSelect":
			UpdateScreenDisplay();
			gameState = "CharacterSelectWait";
			break;
			case "LevelSelect":
			UpdateScreenDisplay();
			gameState = "LevelSelectWait";
			break;
			case "AnimateGarden":
			UpdateScreenDisplay();
			gardenLogicObj.AnimateFlag = true;
			gameState = "AnimateGardenWait";
			break;
			case "PlayGame":
			UpdateScreenDisplay();
			gameState = "PlayerSelectLetter";
			break;
			case "AnimationBreak":
			UpdateScreenDisplay();
			gameState = "AnimationBreakWait";
			break;
			
		}
    }
}
