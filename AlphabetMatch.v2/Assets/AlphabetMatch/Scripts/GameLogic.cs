using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.IO;

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
	
	private List<string> aWordList;
	private List<string> bWordList;
	private List<string> cWordList;
	private List<string> dWordList;
	private List<string> eWordList;
	private List<string> fWordList;
	private List<string> gWordList;
	private List<string> hWordList;
	private List<string> iWordList;
	private List<string> jWordList;
	private List<string> kWordList;
	private List<string> lWordList;
	private List<string> mWordList;
	private List<string> nWordList;
	private List<string> oWordList;
	private List<string> pWordList;
	private List<string> qWordList;
	private List<string> rWordList;
	private List<string> sWordList;
	private List<string> tWordList;
	private List<string> uWordList;
	private List<string> vWordList;
	private List<string> wWordList;
	private List<string> xWordList;
	private List<string> yWordList;
	private List<string> zWordList;
	
	private List<string>[] wordsListArray;
	
	private string[] letterList;
	
	private string[] wordDisplayArray;
	private string currentDisplayLetter;
	private int[] currentLetterIndex;
	private int currentLetterPointer;
	
	private string[] correctAudioArray;
	private string[] incorrectAudioArray;
	
	public GridObject[] gridObjects;
	public TextMeshProUGUI DisplayLetterText;
	
	// Start is called before the first frame update
    void Start()
    {
        gameState = "StartGame";
    }
	
	
	// --------------------- Grid Click Event -------------------------------//
	
	public void CheckGridClick(int _gridNumber){
		//playLetterAudio(gridObjects[_gridNumber].gridLetter);
		//
		if (gridObjects[_gridNumber].gridLetter == currentDisplayLetter){
			// Correct Answer
			playWordAudio(wordDisplayArray[_gridNumber]);
		}else{
			// Incorrect Answer
			playIncorrectAudio();
		}
	}
	
	 
	// --------------------   Load/Display Images  --------------------------//
	
	// get list of image filenames and put into wordlist array
	
	// put images into ArrayList
	public void FillGridImages(){
		for (int i=0;i<gridObjects.Length;i++){
			gridObjects[i].DisplayWordImage(wordDisplayArray[i]);
			gridObjects[i].DisplayWordText(wordDisplayArray[i]);
		}
	}
	
	public void SetGridObjectDisplays(){
		for (int i=0;i<6;i++){
			gridObjects[i].gridLetter = wordDisplayArray[i].Substring(0,1);
			gridObjects[i].gridWord = wordDisplayArray[i];
			gridObjects[i].DisplayWordImage(gridObjects[i].gridWord);
			gridObjects[i].DisplayWordText(gridObjects[i].gridWord);
		}
	}
	// ---------------------  Alphabet Content Selection ----------------------//
	
	private void GenerateVocabularyList(){
		letterList = new string[]{"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"};
		//
		//TO DO: Generate Word List from json file
		aWordList = new List<string>(){"acorn", "angel", "apricot", "april", "apron"};
		bWordList = new List<string>(){"bag", "ball", "balloon", "banana", "bat", "bee", "bell", "book", "boot", "box", "bread", "broom"};
		cWordList = new List<string>(){"cake", "can", "candle", "cap", "car", "carrot", "clock", "cookie", "cup" };
		dWordList = new List<string>(){"dinosaur", "dish", "doll", "door", "doughnut", "drum", "duck" };
		eWordList = new List<string>(){"ear", "easel", "eel", "eraser"};
		fWordList = new List<string>(){"fan", "feather", "fence", "fire", "fish", "flag", "flower", "fly" };
		gWordList = new List<string>(){"garage", "gate", "gift", "glasses", "glove", "grapes", "guitar" };
		hWordList = new List<string>(){"hamburger", "hammer", "hanger", "hat", "heart", "hook", "horse", "hot dog", "house"};
		iWordList = new List<string>(){"ice cream", "ice cube", "ice skate", "icicle", "iron", "ivy"};
		jWordList = new List<string>(){"jacket", "jar", "jello", "jet", "jewel", "jug", "jumprope"};
		kWordList = new List<string>(){"kettle", "key", "keyboard", "kite", "kitten"};
		lWordList = new List<string>(){"ladder", "lady bug", "lamp", "leaf", "lion", "lollipop"};
		mWordList = new List<string>(){"milk", "mitten", "money", "moon", "mosquito", "mouth", "mug", "mushroom" };
		nWordList = new List<string>(){"nail", "necklace", "needle", "nest", "net", "nose"};
		oWordList = new List<string>(){"oatmeal", "oboe", "ocean", "oval", "overalls"};
		pWordList = new List<string>(){"pancakes", "parrot", "pear", "pen", "pencil", "pie", "pig", "pizza", "plane", "popcorn", "pot", "present", "pumpkin" };
		qWordList = new List<string>(){"quarter", "question mark", "quiet", "quilt"};
		rWordList = new List<string>(){"rabbit", "raspberry", "ring", "rock", "rocket", "rooster"};
		sWordList = new List<string>(){"sandwich", "scissors", "sled", "sock", "spoon", "star", "strawberry", "sun"};
		tWordList = new List<string>(){"table", "tomato", "train", "tree", "truck", "tub"};
		uWordList = new List<string>(){"u turn", "unicycle", "uniform", "united states"};
		vWordList = new List<string>(){"vase", "vegtables", "vest", "violin", "volcano"};
		wWordList = new List<string>(){"wagon", "wallet", "walrus", "water", "watermelon", "wheel", "wood" };
		xWordList = new List<string>(){"x axis", "xray fish", "xray"};
		yWordList = new List<string>(){"yarn", "yellow", "yolk", "yoyo"};
		zWordList = new List<string>(){"zebra", "zipper", "zoom", "zucchini"};
		//
		wordsListArray = new List<string>[]{aWordList, bWordList, cWordList, dWordList, eWordList, fWordList, gWordList, hWordList, iWordList, jWordList, kWordList, lWordList, mWordList, nWordList, oWordList, pWordList, qWordList, rWordList, sWordList, tWordList, uWordList, vWordList, wWordList, xWordList, yWordList, zWordList };
	}
	
	private void ExcludeFromVocabularyList(){
	}
	
	public List<string> FindCorrentWords(string _word, int _num){
		List<string> randomWords = new List<string>();
		return randomWords;
	}
	
	public void ClearWordDisplay(){
		wordDisplayArray = new string[6];
	}
	
	public void AddWord(int _pos, string _word){
		wordDisplayArray[_pos] = _word;
	}
	
	public void RandomWordDisplay(){
		RandomizeWordArray(wordDisplayArray);
	}
	
	public void RandomizeWordArray(string[] _words){
		for (int i = _words.Length - 1; i>0 ; i--){
			int r = Random.Range (0, i+1);
			string tmp = _words[i];
			_words[i] = _words[r];
			_words[r] = tmp;
		}
	}
	
	public void RandomizeWordList(List<string> _words){
		for (int i = _words.Count - 1; i>0 ; i--){
			int r = Random.Range (0, i+1);
			string tmp = _words[i];
			_words[i] = _words[r];
			_words[r] = tmp;
		}
	}
	
	public void SetLetterIndex(int _num){
		currentLetterIndex = new int[]{_num, _num + 1, _num + 2};
	}
	
	public void SetCurrentLetter(int _num){
		currentLetterPointer = _num;
		currentDisplayLetter = letterList[_num];
		DisplayLetterText.text = currentDisplayLetter.ToUpper();
	}
	
	public void GenerateRandomDisplayList(){
		// Put all correct words in ArrayList
		List<string> randomCorrectWords = new List<string>();
		for (int i=0; i<wordsListArray[currentLetterPointer].Count; i++){
			randomCorrectWords.Add(wordsListArray[currentLetterPointer][i]);
		}
		// Randomize correct words ArrayList
		RandomizeWordList(randomCorrectWords);
		
		// Put all remaining words in ArrayList
		List<string> randomIncorrectWords = new List<string>();
		for (int j=0; j<26; j++){
			if (j != currentLetterPointer){
				for (int k=0; k<wordsListArray[j].Count; k++){
					randomIncorrectWords.Add(wordsListArray[j][k]);
				}
			}
		}
		// Randomize incorrect words ArrayList
		RandomizeWordList(randomIncorrectWords);
		
		// Create WordDisplayArray
		ClearWordDisplay();
		AddWord(0,randomCorrectWords[0]);
		AddWord(1,randomCorrectWords[1]);
		AddWord(2,randomCorrectWords[2]);
		AddWord(3,randomIncorrectWords[0]);
		AddWord(4,randomIncorrectWords[1]);
		AddWord(5,randomIncorrectWords[2]);
		
		// Randomize WordDisplayArray
		RandomWordDisplay();
	}
	
	public void SetupGrid(){
		GenerateRandomDisplayList();
		SetGridObjectDisplays();
	}
	
	// --------------------   Audio Playback   ------------------------------//
	
	// put audio into ArrayList
	private void InitAudioAssets(){
		correctAudioArray = new string[]{"ex_00", "ex_01", "ex_02", "ex_03", "ex_04", "ex_05", "ex_06", "ex_07", "ex_08", "ex_09", "ex_10", "ex_11", "ex_12", "ex_13", "ex_14"};
		incorrectAudioArray = new string[]{"try_another_00", "try_another_01", "try_another_02"};
	}
	
	// play alphabet character audio
	public void playCharacterAudio(string _filename){
		AudioSource audioletter = gameObject.GetComponent<AudioSource>();
		string letterFilename = "Characters/" + _filename;
		audioletter.PlayOneShot((AudioClip)Resources.Load(letterFilename));
	}
	
	// play alphabet letter audio
	public void playLetterAudio(string _filename){
		AudioSource audioletter = gameObject.GetComponent<AudioSource>();
		string letterFilename = "Objects/Audio/letters/" + _filename;
		audioletter.PlayOneShot((AudioClip)Resources.Load(letterFilename));
	}
	
	// play word audio
	public void playWordAudio(string _filename){
		AudioSource audioword = gameObject.GetComponent<AudioSource>();
		char letter = _filename[0];
		string wordFilename = "Objects/Audio/words/letter" + letter + "/" + _filename;
		audioword.PlayOneShot((AudioClip)Resources.Load(wordFilename));
	}
	
	// play correct audio
	public void playCorrectAudio(){
		AudioSource audioPlay = gameObject.GetComponent<AudioSource>();
		int audioIndex = Random.Range(0,correctAudioArray.Length);
		string audioFilename = "Correct/" + correctAudioArray[audioIndex];
		audioPlay.PlayOneShot((AudioClip)Resources.Load(audioFilename));
	}
	
	// play incorrect audio
	public void playIncorrectAudio(){
		AudioSource audioPlay = gameObject.GetComponent<AudioSource>();
		int audioIndex = Random.Range(0,incorrectAudioArray.Length);
		string audioFilename = "Incorrect/" + incorrectAudioArray[audioIndex];
		audioPlay.PlayOneShot((AudioClip)Resources.Load(audioFilename));
	}
	
	// --------------------  Alphabet Game States ---------------------------//
	public void SetGameState(string _state){
		gameState = _state;
	}
	
	public void StartGame(){
		gameState = "CharacterSelect";
	}
	
	public void PlayGame(){
		if (!gardenLogicObj.AnimateFlag){
			StopGardenAnimate();
			SetupGrid();
			gameState = "PlayGame";
		}
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
			GenerateVocabularyList();
			InitAudioAssets();
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
	
	// --------------------  End Alphabet Game States ---------------------------//
	
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
	//
	
	
	public void SelectGridButton(int _buttonNumber){
		Debug.Log("Num : "+_buttonNumber);
		// Check Answer / Play Sound
		CheckGridClick(_buttonNumber);
		
		
		// Animate Letters
		// --- End Of Round -- Animation Break??
		
		
		
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
