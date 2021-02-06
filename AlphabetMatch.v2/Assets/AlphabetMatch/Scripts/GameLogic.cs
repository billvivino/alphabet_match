using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.IO;
using System.Runtime.Serialization.Formatters.Binary;

public class GameLogic : MonoBehaviour
{
    public GardenLogic gardenLogicObj;
	public LetterCharacterAnimate LetterCharacterObj;
	public RectTransform LetterCharacterTransform;
	//
	public LetterCharacterAnimate AnimateCharacter1Obj;
	public RectTransform AnimateCharacter1Transform;
	public LetterCharacterAnimate AnimateCharacter2Obj;
	public RectTransform AnimateCharacter2Transform;
	public ImageObject AnimateObject;
	public RectTransform AnimateObjectTransform;
	//
	public string gameState;
	public string characterSelection;
	public int levelNumber;
	
	public GameObject StartScreen;
	public GameObject CharacterScreen;
	public GameObject LevelScreen;
	public GameObject GardenScreen;
	public GameObject PlayScreen;
	public GameObject AnimateScreen;
	public GameObject AnalyticsScreen;
	
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
	public RectTransform[] gridTransforms;
	public Image DisplayLetterText;
	public RectTransform DisplayGridTransform;
	public RectTransform DisplayLetterTransform;
	public GameObject[] starObjects;
	
	public int currentGridClick;
	
	int CorrectLetterCounter;
	int CorrectLetterTotal;
	int letterIndex;
	bool audioPlayIntro;
	
	public TextMeshProUGUI todayText;
	public TextMeshProUGUI weekText;
	public TextMeshProUGUI monthText;
	public TextMeshProUGUI alltimeText;
	
	string todayDateString;
	public SaveDataObject saveDataObj;
	public SaveDataObject weekDataObj;
	public SaveDataObject monthDataObj;
	
	public float startTime;
	public float elapsedTime;
	
	public TextMeshProUGUI[] LevelsText;
	public TextMeshProUGUI[] PercentText;
	public TextMeshProUGUI[] TimeSpentText;
	
	public TMPro.TMP_Dropdown LettersMenu;
	
	public int AnimationBreakNumber;
	public int RandomCharIndex1;
	public int RandomCharIndex2;
	public int RandomLetterIndex;
	public int RandomItemIndex;
	
	public GameObject MusicOnObj;
	public GameObject MusicOffObj;
	public AudioSource MusicSource; 
	
	// Start is called before the first frame update
    void Start()
    {
        gameState = "StartGame";
		currentGridClick = -1;
		// Load Previous Data
		todayDateString = CreateFilename(0);	
		Debug.Log(todayDateString);
		saveDataObj = new SaveDataObject();
		saveDataObj.Init();
		saveDataObj.InitSum();
		LoadData(todayDateString, saveDataObj);
		//
		for (int i=0;i<26;i++){
			Debug.Log("LP" + saveDataObj.medlevelPlayed[i]);
		}
		//
		LoadWeekData();
		LoadMonthData();
		//
		playVOAudio("title_new");
		//
		toggleMusicOn();
    }
	// --------------------- Load/Save Usage Data ---------------------------//
	
	// A - Z, Datename, Levels, % Correct, Time Spent'
	
	private string CreateFilename(int _days){
		System.DateTime dt = System.DateTime.Now.AddDays(_days);
		string Day = dt.Day.ToString();
		string Month = dt.Month.ToString();
		string Year = dt.Year.ToString();
		if (Day.Length == 1){
			Day = "0" + Day;
		}
		if (Month.Length == 1){
			Month = "0" + Month;
		}
		string dateString = Year + Month + Day;
		return dateString;
	}
	
	private void LoadWeekData(){
		string loadDateString;
		weekDataObj = new SaveDataObject();
		weekDataObj.Init();
		weekDataObj.InitSum();
		for (int i=0;i<7;i++){
			loadDateString = CreateFilename(-i);
			LoadData(loadDateString, weekDataObj);
		}
	}
	
	private void LoadMonthData(){
		string loadDateString;
		monthDataObj = new SaveDataObject();
		monthDataObj.Init();
		monthDataObj.InitSum();
		for (int i=0;i<30;i++){
			loadDateString = CreateFilename(-i);
			LoadData(loadDateString, monthDataObj);
		}
	}
	
	private void LoadData(string _dateName, SaveDataObject _dataObj){
		if (File.Exists(Application.persistentDataPath + "/" + _dateName + ".save")){
			BinaryFormatter bf = new BinaryFormatter();
			FileStream file = File.Open(Application.persistentDataPath + "/" + _dateName + ".save", FileMode.Open);
			Save save = (Save)bf.Deserialize(file);
			file.Close();
			//
			for (int i=0 ; i<save.lowlevelPlayed.Count ; i++)
			{
				_dataObj.lowlevelPlayed[i] += save.lowlevelPlayed[i];
				_dataObj.medlevelPlayed[i] += save.medlevelPlayed[i];
				_dataObj.highlevelPlayed[i] += save.highlevelPlayed[i];
				//
				_dataObj.lowlevelMiss[i] += save.lowlevelMiss[i];
				_dataObj.medlevelMiss[i] += save.medlevelMiss[i];
				_dataObj.highlevelMiss[i] += save.highlevelMiss[i];
				//
				_dataObj.lowlevelTime[i] += save.lowlevelTime[i];
				_dataObj.medlevelTime[i] += save.medlevelTime[i];
				_dataObj.highlevelTime[i] += save.highlevelTime[i];				
			}	
		}else{
			Debug.Log("No Save Data");
		}
	}
	
	private Save CreateSaveDataObject(){
		Save save = new Save();
		//
		for (int i=0; i<26; i++){
			save.lowlevelPlayed.Add(saveDataObj.lowlevelPlayed[i]);
			save.medlevelPlayed.Add(saveDataObj.medlevelPlayed[i]);
			save.highlevelPlayed.Add(saveDataObj.highlevelPlayed[i]);
			//
			save.lowlevelMiss.Add(saveDataObj.lowlevelMiss[i]);
			save.medlevelMiss.Add(saveDataObj.medlevelMiss[i]);
			save.highlevelMiss.Add(saveDataObj.highlevelMiss[i]);
			//
			save.lowlevelTime.Add((int)saveDataObj.lowlevelTime[i]);
			save.medlevelTime.Add((int)saveDataObj.medlevelTime[i]);
			save.highlevelTime.Add((int)saveDataObj.highlevelTime[i]);
		}
		return save;
	}
	
	public void SaveData(string _dateName){
		Save save = CreateSaveDataObject();
		//
		BinaryFormatter bf = new BinaryFormatter();
		FileStream file = File.Create(Application.persistentDataPath + "/" + _dateName + ".save");
		bf.Serialize(file, save);
		file.Close();
	}
	
	public void DropDownMenuToggleData(){
		ParseDisplayData(LettersMenu.value-1, saveDataObj);
	}
	
	void ParseDisplayData(int _letterSelect, SaveDataObject _dataObj){
		if (_letterSelect == -1){
			_dataObj.InitSum();
			_dataObj.TotalSum();
			//
			LevelsText[0].text = _dataObj.lowlevelSum.ToString();
			LevelsText[1].text = _dataObj.medlevelSum.ToString();
			LevelsText[2].text = _dataObj.highlevelSum.ToString();
			//
			float lowPercent = 0;
			float medPercent = 0;
			float highPercent = 0;
			float totalPercent = 0;
			if (_dataObj.lowlevelSum!=0){
				lowPercent = 100f - (100f * (_dataObj.lowmissSum / (_dataObj.lowlevelSum * 3f + _dataObj.lowmissSum )));
				Debug.Log(lowPercent);
			}
			if (saveDataObj.medlevelSum!=0){
				medPercent = 100f - (100f * (_dataObj.medmissSum / (_dataObj.medlevelSum * 3f + _dataObj.medmissSum )));
			}
			if (saveDataObj.highlevelSum!=0){
				highPercent = 100f - (100f * (_dataObj.highmissSum / (_dataObj.highlevelSum * 3f + _dataObj.highmissSum )));
			}
			//
			PercentText[0].text = lowPercent.ToString("F1");
			PercentText[1].text = medPercent.ToString("F1");
			PercentText[2].text = highPercent.ToString("F1");
			//
			float lowMinutes = _dataObj.lowtimeSum / 60f;
			float medMinutes = _dataObj.medtimeSum / 60f;
			float highMinutes = _dataObj.hightimeSum / 60f;
			//
			TimeSpentText[0].text = lowMinutes.ToString("F1");
			TimeSpentText[1].text = medMinutes.ToString("F1");
			TimeSpentText[2].text = highMinutes.ToString("F1");
			//
			if (_dataObj.levelSum!=0){
				totalPercent = 100f - (100f * (_dataObj.missSum / (_dataObj.levelSum * 3f + _dataObj.missSum )));
			}
			float totalMinutes = _dataObj.timeSum / 60f;
			LevelsText[3].text = _dataObj.levelSum.ToString();
	        PercentText[3].text = totalPercent.ToString("F1");
			TimeSpentText[3].text = totalMinutes.ToString("F1");
		}else{
			_dataObj.InitSum();
			_dataObj.LevelSum(_letterSelect);
			//
			LevelsText[0].text = _dataObj.lowlevelPlayed[_letterSelect].ToString();
			LevelsText[1].text = _dataObj.medlevelPlayed[_letterSelect].ToString();
			LevelsText[2].text = _dataObj.highlevelPlayed[_letterSelect].ToString();
			//
			float lowPercent = 0;
			float medPercent = 0;
			float highPercent = 0;
			float totalPercent = 0;
			if (_dataObj.lowlevelPlayed[_letterSelect]!=0){
				lowPercent = 100f - (100f * (_dataObj.lowlevelMiss[_letterSelect] / (_dataObj.lowlevelPlayed[_letterSelect] * 3f + _dataObj.lowlevelMiss[_letterSelect] )));
			}
			if (saveDataObj.medlevelPlayed[_letterSelect]!=0){
				medPercent = 100f - (100f * (_dataObj.medlevelMiss[_letterSelect] / (_dataObj.medlevelPlayed[_letterSelect] * 3f + _dataObj.medlevelMiss[_letterSelect] )));
			}
			if (saveDataObj.highlevelPlayed[_letterSelect]!=0){
				highPercent = 100f - (100f * (_dataObj.highlevelMiss[_letterSelect] / (_dataObj.highlevelPlayed[_letterSelect]* 3f + _dataObj.highlevelMiss[_letterSelect])));
			}
			//
			PercentText[0].text = lowPercent.ToString("F1");
			PercentText[1].text = medPercent.ToString("F1");
			PercentText[2].text = highPercent.ToString("F1");
			//
			float lowMinutes = _dataObj.lowlevelTime[_letterSelect] / 60f;
			float medMinutes = _dataObj.medlevelTime[_letterSelect] / 60f;
			float highMinutes = _dataObj.highlevelTime[_letterSelect] / 60f;
			//
			TimeSpentText[0].text = lowMinutes.ToString("F1");
			TimeSpentText[1].text = medMinutes.ToString("F1");
			TimeSpentText[2].text = highMinutes.ToString("F1");
			//
			if (_dataObj.levelSum!=0){
				totalPercent = 100f - (100f * (_dataObj.missSum / (_dataObj.levelSum * 3f + _dataObj.missSum )));
			}
			float totalMinutes = _dataObj.timeSum / 60f;
			LevelsText[3].text = _dataObj.levelSum.ToString();
	        PercentText[3].text = totalPercent.ToString("F1");
			TimeSpentText[3].text = totalMinutes.ToString("F1");
		}
		
	}
	
	// --------------------- Grid Click Event -------------------------------//
	
	public void CheckGridClick(int _gridNumber){
		//playLetterAudio(gridObjects[_gridNumber].gridLetter);
		//
		if (gridObjects[_gridNumber].gridLetter == currentDisplayLetter){
			
			// AnimateToLetter
			if (!gridObjects[_gridNumber].clickObjectFlag && gridObjects[_gridNumber].gameObject.activeSelf){
				Debug.Log("CORRECT");
				gridObjects[_gridNumber].clickObjectFlag = true;
				//
				starObjects[_gridNumber].GetComponent<Stars>().Animate();
				// Correct Answer
				if (levelNumber == 2){
					// Play Word Sound
					playWordAudio(wordDisplayArray[_gridNumber]);
				}else{
					// Play Letter Sound
					playLetterAudio(wordDisplayArray[_gridNumber].Substring(0,1));
				}
				//
				LetterCharacterObj.ShowCharacter(currentLetterPointer);
				if (currentGridClick == -1){
					currentGridClick = _gridNumber;
					LetterCharacterTransform.localPosition = new Vector3(LetterCharacterTransform.localPosition.x, gridObjects[currentGridClick].transform.localPosition.y, LetterCharacterTransform.localPosition.z);
					LeanTween.move(LetterCharacterTransform, gridObjects[currentGridClick].transform.localPosition, 0.75f).setOnComplete(OnAnimateOffScreen);
				}else{
					currentGridClick = _gridNumber;
					LeanTween.cancelAll();
					LeanTween.move(LetterCharacterTransform, gridObjects[currentGridClick].transform.localPosition, 0.75f).setOnComplete(OnAnimateOffScreen);
				}
			}
		}else{
			Debug.Log("INCORRECT");
			// Incorrect Answer
			if (currentGridClick == -1){
				playIncorrectAudio();
				// Shake Letters
				ShakeGrid();
				//
				if (levelNumber == 0){
					saveDataObj.lowlevelMiss[currentLetterIndex[letterIndex]]+=1;
				}
				if (levelNumber == 1){
					saveDataObj.medlevelMiss[currentLetterIndex[letterIndex]]+=1;
				}
				if (levelNumber == 2){
					saveDataObj.highlevelMiss[currentLetterIndex[letterIndex]]+=1;
				}
			}
			
		}
	}
	
	// -------------------- Animate Stars FX --------------------------------//
	public void ResetStars(){
		for (int i=0; i<6 ;i++){
			starObjects[i].GetComponent<Stars>().Reset();
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
			if (levelNumber == 2){
				// Hard Level
				gridObjects[i].DisplayWordText(gridObjects[i].gridWord);
				gridObjects[i].DisplayWordImage(gridObjects[i].gridWord);
				gridObjects[i].gridImage.color = new Color(1.0f, 1.0f, 1.0f, 1.0f);
				//gridObjects[i].DisplayLetterImage("");
				gridObjects[i].ClearLetterImage();
			}
			if (levelNumber == 1){
			// Med Level
				gridObjects[i].DisplayWordText(gridObjects[i].gridWord.Substring(0,1));
				gridObjects[i].DisplayWordImage(gridObjects[i].gridWord);
				gridObjects[i].gridImage.color = new Color(1.0f, 1.0f, 1.0f, 0.6f);
				//gridObjects[i].DisplayLetterImage("");
				gridObjects[i].ClearLetterImage();
			}
			if (levelNumber == 0){
				// Easy Level
				gridObjects[i].ClearWordImage();
				gridObjects[i].ClearWordText();
				gridObjects[i].DisplayLetterImage(gridObjects[i].gridWord.Substring(0,1));
			}
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
		if (_num==24){
			currentLetterIndex = new int[]{_num, _num + 1, 0};
		}
		if (_num==25){
			currentLetterIndex = new int[]{_num, 0, 1};
		}
	}
	
	public void SetCurrentLetter(int _num){
		currentLetterPointer = _num;
		currentDisplayLetter = letterList[_num];
		string imageFilename = "Letters/" + currentDisplayLetter + "_letter";
		DisplayLetterText.sprite = Resources.Load<Sprite>(imageFilename);
		//DisplayLetterText.text = currentDisplayLetter.ToUpper();
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
		
		// Number of Correct Letter Tiles
		CorrectLetterCounter = 0;
		CorrectLetterTotal = 3;
		
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
		ResetStars();
		GenerateRandomDisplayList();
		SetGridObjectDisplays();
	}
	
	// --------------------   Audio Playback   ------------------------------//
	
	// put audio into ArrayList
	private void InitAudioAssets(){
		correctAudioArray = new string[]{"ex_00", "ex_01", "ex_02", "ex_03", "ex_04", "ex_05", "ex_06", "ex_07", "ex_08", "ex_09", "ex_10", "ex_11", "ex_12", "ex_13", "ex_14"};
		incorrectAudioArray = new string[]{"try_another_00", "try_another_01", "try_another_02"};
	}
	
	// play vo audio
	public void playVOAudio(string _filename){
		AudioSource audioletter = gameObject.GetComponent<AudioSource>();
		string letterFilename = "VO/" + _filename;
		audioletter.PlayOneShot((AudioClip)Resources.Load(letterFilename));
	}
	
	// play alphabet character audio
	public void playCharacterAudio(int _filenum){
		string _filename = new string[]{"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"}[_filenum];
		AudioSource audioletter = gameObject.GetComponent<AudioSource>();
		string letterFilename = "Characters/Audio/" + _filename;
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
	
	public void toggleMusicOn(){
		MusicOnObj.SetActive(true);
		MusicOffObj.SetActive(false);
		MusicSource.mute = false;
	}
	
	public void toggleMusicOff(){
		MusicOnObj.SetActive(false);
		MusicOffObj.SetActive(true);
		MusicSource.mute = true;
	}
	
	// --------------------  Alphabet Game States ---------------------------//
	public void SetGameState(string _state){
		gameState = _state;
	}
	
	public void StartGame(){
		gameState = "CharacterSelect";
	}
	
	public void Analytics(){
		gameState = "AnalyticsSelect";
	}
	
	public void PlayGame(){
		if (!gardenLogicObj.AnimateFlag){
			
			ResetGrid();
			letterIndex = 0;
			SetCurrentLetter(currentLetterIndex[letterIndex]);
			StopGardenAnimate();
			GardenScreen.SetActive(false);
			SetupGrid();
			gameState = "PlayGame";
		}else{
			gardenLogicObj.AnimateStop = gardenLogicObj.AnimateCounter;
			gardenLogicObj.randomLetterIndex = gardenLogicObj.LetterCounter+1;
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
			case "AnalyticsSelect":
			toggleTimeFrame(0);
			AnalyticsScreen.SetActive(true);
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
	
	public void toggleTimeFrame(int _timeScale){
		switch(_timeScale){
			case 0:
			Debug.Log("DAY");
			ParseDisplayData(-1, saveDataObj);
			//
			todayText.color = new Color(1f, 1f, 0.25f);
			weekText.color = new Color(1f, 1f, 1f);
			monthText.color = new Color(1f, 1f, 1f);
			alltimeText.color = new Color(1f, 1f, 1f);
			break;
			case 1:
			Debug.Log("Week");
			ParseDisplayData(-1, weekDataObj);
			//
			todayText.color = new Color(1f, 1f, 1f);
			weekText.color = new Color(1f, 1f, 0.25f);
			monthText.color = new Color(1f, 1f, 1f);
			alltimeText.color = new Color(1f, 1f, 1f);
			break;
			case 2:
			Debug.Log("Month!");
			ParseDisplayData(-1, monthDataObj);
			//
			todayText.color = new Color(1f, 1f, 1f);
			weekText.color = new Color(1f, 1f, 1f);
			monthText.color = new Color(1f, 1f, 0.25f);
			alltimeText.color = new Color(1f, 1f, 1f);
			break;
			case 3:
			todayText.color = new Color(1f, 1f, 1f);
			weekText.color = new Color(1f, 1f, 1f);
			monthText.color = new Color(1f, 1f, 1f);
			alltimeText.color = new Color(1f, 1f, 0.25f);
			break;
		}
	}
	
	// -------------------------------------------------------------------------//
	
	void HideScreens(){
		ClearGlows();
		GetComponent<AudioSource>().Stop();
		StartScreen.SetActive(false);
	    CharacterScreen.SetActive(false);
		LevelScreen.SetActive(false);
		GardenScreen.SetActive(false);
		PlayScreen.SetActive(false);
		AnimateScreen.SetActive(false);
		AnalyticsScreen.SetActive(false);
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
		SaveData(todayDateString);
		LeanTween.cancelAll();
		StopGardenAnimate();
		gameState = "AnimateGarden";
	}
	
	public void StopAnimationBreak(){
		LeanTween.cancelAll();
		gameState = "AnimateGarden";
	}
	//
	
	public void SelectGridButton(int _buttonNumber){
		Debug.Log("Num : "+_buttonNumber);
		// Check Answer / Play Sound
		CheckGridClick(_buttonNumber);	
	}
	
	void OnAnimateOffScreen(){
		// "Good Job!"
		if (levelNumber < 2){
			playCorrectAudio();
		}
		//
		CorrectLetterCounter++;
		// AnimateToOffScreen
		gridObjects[currentGridClick].GetComponent<GridObject>().followCharacterFlag = true;
		Vector3 offScreenPosition = new Vector3(650f, LetterCharacterTransform.localPosition.y, LetterCharacterTransform.localPosition.z);
		LeanTween.move(LetterCharacterTransform, offScreenPosition, 0.75f).setDelay(1f).setOnComplete(OnAnimateReset);
	}
	
	void OnAnimateReset(){
		// ResetAnimateParameters
		LetterCharacterTransform.localPosition = new Vector3(-650f, LetterCharacterTransform.localPosition.y, LetterCharacterTransform.localPosition.z);
		gridObjects[0].GetComponent<GridObject>().followCharacterFlag = false;
		gridObjects[1].GetComponent<GridObject>().followCharacterFlag = false;
		gridObjects[2].GetComponent<GridObject>().followCharacterFlag = false;
		gridObjects[3].GetComponent<GridObject>().followCharacterFlag = false;
		gridObjects[4].GetComponent<GridObject>().followCharacterFlag = false;
		gridObjects[5].GetComponent<GridObject>().followCharacterFlag = false;
		gridObjects[currentGridClick].gameObject.SetActive(false);
		currentGridClick = -1;
		CheckEndPlayScreen();
	}
	
	void CheckEndPlayScreen(){
		if (CorrectLetterCounter >= CorrectLetterTotal){
			currentGridClick = -2;
			LeanTween.move(gridTransforms[0], new Vector3(-162f, -642f, 0f), 0.5f).setDelay(0.5f);
			LeanTween.move(gridTransforms[1], new Vector3(1f, -642f, 0f), 0.5f).setDelay(0.5f);
			LeanTween.move(gridTransforms[2], new Vector3(164f, -642f, 0f), 0.5f).setDelay(0.5f);
			LeanTween.move(gridTransforms[3], new Vector3(-162f, -703f, 0f), 0.5f).setDelay(0.5f);
			LeanTween.move(gridTransforms[4], new Vector3(1f, -703f, 0f), 0.5f).setDelay(0.5f);
			LeanTween.move(gridTransforms[5], new Vector3(164f, -703f, 0f), 0.5f).setDelay(0.5f).setOnComplete(OnResetPlayScreen);	
		}
	}
	
	void ShakeGrid(){
		LeanTween.move(gridTransforms[0], new Vector3(gridTransforms[0].localPosition.x + Random.Range(-0.5f, 0.5f)*40f, gridTransforms[0].localPosition.y, 0f), 0.15f).setEaseInOutCirc().setRepeat(8).setLoopPingPong();
		LeanTween.move(gridTransforms[1], new Vector3(gridTransforms[1].localPosition.x + Random.Range(-0.5f, 0.5f)*40f, gridTransforms[1].localPosition.y, 0f), 0.15f).setEaseInOutCirc().setRepeat(8).setLoopPingPong();
		LeanTween.move(gridTransforms[2], new Vector3(gridTransforms[2].localPosition.x + Random.Range(-0.5f, 0.5f)*40f, gridTransforms[2].localPosition.y, 0f), 0.15f).setEaseInOutCirc().setRepeat(8).setLoopPingPong();
		LeanTween.move(gridTransforms[3], new Vector3(gridTransforms[3].localPosition.x + Random.Range(-0.5f, 0.5f)*40f, gridTransforms[3].localPosition.y, 0f), 0.15f).setEaseInOutCirc().setRepeat(8).setLoopPingPong();
		LeanTween.move(gridTransforms[4], new Vector3(gridTransforms[4].localPosition.x + Random.Range(-0.5f, 0.5f)*40f, gridTransforms[4].localPosition.y, 0f), 0.15f).setEaseInOutCirc().setRepeat(8).setLoopPingPong();
		LeanTween.move(gridTransforms[5], new Vector3(gridTransforms[5].localPosition.x + Random.Range(-0.5f, 0.5f)*40f, gridTransforms[5].localPosition.y, 0f), 0.15f).setEaseInOutCirc().setRepeat(8).setLoopPingPong();
	}
	
	void ResetGrid(){
		LetterCharacterTransform.localPosition = new Vector3(-650f, 0f, 0f);
		currentGridClick = -1;
		//
		gridObjects[0].gameObject.SetActive(true);
		gridObjects[1].gameObject.SetActive(true);
		gridObjects[2].gameObject.SetActive(true);
		gridObjects[3].gameObject.SetActive(true);
		gridObjects[4].gameObject.SetActive(true);
		gridObjects[5].gameObject.SetActive(true);
		//
		gridObjects[0].followCharacterFlag = false;
		gridObjects[1].followCharacterFlag = false;
		gridObjects[2].followCharacterFlag = false;
		gridObjects[3].followCharacterFlag = false;
		gridObjects[4].followCharacterFlag = false;
		gridObjects[5].followCharacterFlag = false;
		//
		gridObjects[0].clickObjectFlag = false;
		gridObjects[1].clickObjectFlag = false;
		gridObjects[2].clickObjectFlag = false;
		gridObjects[3].clickObjectFlag = false;
		gridObjects[4].clickObjectFlag = false;
		gridObjects[5].clickObjectFlag = false;
		//
		gridTransforms[0].localPosition =  new Vector3(-162f, 42f, 0f);
		gridTransforms[1].localPosition =  new Vector3(1f, 42f, 0f);
		gridTransforms[2].localPosition =  new Vector3(164f, 42f, 0f);
		gridTransforms[3].localPosition =  new Vector3(-162f, -103f, 0f);
		gridTransforms[4].localPosition =  new Vector3(1f, -103f, 0f);
		gridTransforms[5].localPosition = new Vector3(164f, -103f, 0f);
	}

	void OnResetPlayScreen(){
		elapsedTime = Time.time - startTime;
		if (levelNumber == 0){
			saveDataObj.lowlevelPlayed[currentLetterIndex[letterIndex]]+=1;
			saveDataObj.lowlevelTime[currentLetterIndex[letterIndex]] += (int)elapsedTime;
		}
		if (levelNumber == 1){
			saveDataObj.medlevelPlayed[currentLetterIndex[letterIndex]]+=1;
			saveDataObj.medlevelTime[currentLetterIndex[letterIndex]] += (int)elapsedTime;
		}
		if (levelNumber == 2){
			saveDataObj.highlevelPlayed[currentLetterIndex[letterIndex]]+=1;
			saveDataObj.highlevelTime[currentLetterIndex[letterIndex]] += (int)elapsedTime;
		}
		//
		letterIndex++;
		if (letterIndex<currentLetterIndex.Length){
			ResetGrid();
			SetCurrentLetter(currentLetterIndex[letterIndex]);
			SetupGrid();
			//
			gameState = "PlayGame";
		}else{
			letterIndex = 0;
			if (AnimationBreakNumber == 0){
				RandomCharIndex1 = (int)Random.Range(0, 25);
				RandomCharIndex2 = (int)Random.Range(0, 25);
				RandomLetterIndex = (int)Random.Range(0, 25);
				RandomItemIndex = (int)Random.Range(0, wordsListArray[RandomLetterIndex].Count-1);
				//
				AnimateCharacter1Obj.ShowCharacter(RandomCharIndex1);
				AnimateCharacter2Obj.ShowCharacter(RandomCharIndex2);
				AnimateObject.DisplayWordImage(wordsListArray[RandomLetterIndex][RandomItemIndex]);
			}
			if (AnimationBreakNumber<3){
				SaveData(todayDateString);
				gameState = "AnimationBreak";
			}else{
				StopPlayGame();
			}
		}
	}
	
	void StartAnimation(int _animationNumber){
		switch (_animationNumber){
			case 0:
				AnimateObject.followCharacter1Flag = false;
				AnimateObject.followCharacter2Flag = false;
				LeanTween.move(AnimateCharacter1Transform, new Vector3(-650f, AnimateCharacter1Transform.localPosition.y, AnimateCharacter1Transform.localPosition.z), 0f);
				LeanTween.move(AnimateCharacter2Transform, new Vector3(650f, AnimateCharacter2Transform.localPosition.y, AnimateCharacter2Transform.localPosition.z), 0f);
				LeanTween.move(AnimateObjectTransform, new Vector3(-650f, AnimateCharacter2Transform.localPosition.y, AnimateCharacter2Transform.localPosition.z), 0f);
				AnimationBreak1();
				break;
			case 1:
				AnimateObject.followCharacter1Flag = false;
				AnimateObject.followCharacter2Flag = false;
				LeanTween.move(AnimateCharacter1Transform, new Vector3(-650f, AnimateCharacter1Transform.localPosition.y, AnimateCharacter1Transform.localPosition.z), 0f);
				LeanTween.move(AnimateObjectTransform, new Vector3(100f, AnimateCharacter2Transform.localPosition.y, AnimateCharacter2Transform.localPosition.z), 0f);
				AnimationBreak2();
				break;	
			case 2:
				AnimateObject.followCharacter1Flag = false;
				AnimateObject.followCharacter2Flag = false;
				LeanTween.move(AnimateCharacter1Transform, new Vector3(-650f, AnimateCharacter1Transform.localPosition.y, AnimateCharacter1Transform.localPosition.z), 0f);
				LeanTween.move(AnimateCharacter2Transform, new Vector3(650f, AnimateCharacter2Transform.localPosition.y, AnimateCharacter2Transform.localPosition.z), 0f);
				LeanTween.move(AnimateObjectTransform, new Vector3(-650f, AnimateCharacter2Transform.localPosition.y, AnimateCharacter2Transform.localPosition.z), 0f);
				AnimationBreak3();
				break;	
		}
	}
	
	void AnimationBreak1(){
		// Move On Screen
		Vector3 onScreenPosition = new Vector3(-100f, AnimateCharacter1Transform.localPosition.y, AnimateCharacter1Transform.localPosition.z);
		LeanTween.move(AnimateCharacter1Transform, onScreenPosition, 1.25f).setOnComplete(OnAnimateBreak1Mid);
	}
	
	void OnAnimateBreak1Mid(){
		// Play Audio
		playCharacterAudio(RandomCharIndex1);
		// Bounce Character
		LeanTween.move(AnimateCharacter1Transform, new Vector3(-100f, AnimateCharacter1Transform.localPosition.y + 30f, 0f), 0.4f).setEaseInOutCirc().setRepeat(8).setLoopPingPong().setOnComplete(OnAnimateBreak1MoveOff);
	}
	
	void OnAnimateBreak1MoveOff(){
		// Move Off Screen
		Vector3 offScreenPosition = new Vector3(650f, AnimateCharacter1Transform.localPosition.y, AnimateCharacter1Transform.localPosition.z);
		LeanTween.move(AnimateCharacter1Transform, offScreenPosition, 1.25f).setOnComplete(OnAnimateBreakEnd);
	}
	
	void OnAnimateBreakEnd(){
		AnimationBreakNumber++;
		if (AnimationBreakNumber<3){
			ResetGrid();
			SetCurrentLetter(currentLetterIndex[letterIndex]);
			SetupGrid();
			//
			gameState = "PlayGame";
		}else{
			StopPlayGame();
		}
	}
	
	void AnimationBreak2(){
		// Move On Screen
		Vector3 onScreenPosition = new Vector3(-100f, AnimateCharacter1Transform.localPosition.y, AnimateCharacter1Transform.localPosition.z);
		LeanTween.move(AnimateCharacter1Transform, onScreenPosition, 1.25f).setOnComplete(OnAnimateBreak2Mid);
	}
	
	void OnAnimateBreak2Mid(){
		// Play Audio
		playWordAudio(wordsListArray[RandomLetterIndex][RandomItemIndex]);
		// Bounce Item
		LeanTween.move(AnimateObjectTransform, new Vector3(100f, AnimateObjectTransform.localPosition.y + 30f, 0f), 0.4f).setEaseInOutCirc().setRepeat(8).setLoopPingPong().setOnComplete(OnAnimateBreak2Move2Item);
	}
	
	void OnAnimateBreak2Move2Item(){
		// Move to Item
		Vector3 itemScreenPosition = new Vector3(AnimateObjectTransform.localPosition.x, AnimateCharacter1Transform.localPosition.y, AnimateCharacter1Transform.localPosition.z);
		LeanTween.move(AnimateCharacter1Transform, itemScreenPosition, 1.25f).setOnComplete(OnAnimateBreak2MoveOff);
	}
	
	void OnAnimateBreak2MoveOff(){
		// Move Off Screen
		AnimateObject.followCharacter1Flag = true;
		Vector3 offScreenPosition = new Vector3(650f, AnimateCharacter1Transform.localPosition.y, AnimateCharacter1Transform.localPosition.z);
		LeanTween.move(AnimateCharacter1Transform, offScreenPosition, 1.25f).setOnComplete(OnAnimateBreakEnd);
	}
	
	void AnimationBreak3(){
		// Move On Screen
		Vector3 onScreen1Position = new Vector3(-100f, AnimateCharacter1Transform.localPosition.y, AnimateCharacter1Transform.localPosition.z);
		Vector3 onScreen2Position = new Vector3(100f, AnimateCharacter2Transform.localPosition.y, AnimateCharacter2Transform.localPosition.z);
		LeanTween.move(AnimateCharacter1Transform, onScreen1Position, 1.2f);
		LeanTween.move(AnimateObjectTransform, onScreen1Position, 1.2f);
		LeanTween.move(AnimateCharacter2Transform, onScreen2Position, 1.2f).setOnComplete(OnAnimateBreak3Mid);
	}
	
	void OnAnimateBreak3Mid(){
		// Play Audio
		playCharacterAudio(RandomCharIndex2);
		// Bounce Item
		LeanTween.move(AnimateCharacter2Transform, new Vector3(100f, AnimateCharacter2Transform.localPosition.y + 30f, 0f), 0.4f).setEaseInOutCirc().setRepeat(8).setLoopPingPong().setOnComplete(OnAnimateBreak3Move2Item);
	}
	
	void OnAnimateBreak3Move2Item(){
		// Move to Item
		Vector3 itemScreenPosition = new Vector3(AnimateCharacter2Transform.localPosition.x, AnimateObjectTransform.localPosition.y, AnimateCharacter2Transform.localPosition.z);
		LeanTween.move(AnimateObjectTransform, itemScreenPosition, 1f).setOnComplete(OnAnimateBreak3MoveOff);
	}
	
	void OnAnimateBreak3MoveOff(){
		// Move Off Screen
		AnimateObject.followCharacter2Flag = true;
		Vector3 offScreenPosition = new Vector3(650f, AnimateCharacter2Transform.localPosition.y, AnimateCharacter2Transform.localPosition.z);
		LeanTween.move(AnimateCharacter2Transform, offScreenPosition, 1.25f).setOnComplete(OnAnimateBreakEnd);
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
			case "AnalyticsSelect":
			UpdateScreenDisplay();
			ParseDisplayData(-1, saveDataObj);
			gameState = "AnalyticsSelectWait";
			break;
			case "LevelSelect":
			UpdateScreenDisplay();
			gameState = "LevelSelectWait";
			break;
			case "AnimateGarden":
			UpdateScreenDisplay();
			AnimationBreakNumber = 0;
			//gardenLogicObj.AnimateFlag = true;
			gameState = "AnimateGardenWait";
			break;
			case "PlayGame":
			startTime = Time.time;
			UpdateScreenDisplay();
			// Pop size of Letter
			LeanTween.size(DisplayGridTransform, DisplayGridTransform.sizeDelta * 1.1f, 0.75f).setDelay(0.5f).setEaseInOutCirc().setRepeat(4).setLoopPingPong();
			LeanTween.size(DisplayLetterTransform, DisplayLetterTransform.sizeDelta * 1.1f, 0.75f).setDelay(0.5f).setEaseInOutCirc().setRepeat(4).setLoopPingPong();
			// VO Instructions
			audioPlayIntro = true;
			playVOAudio("touch_and_say_letter");
			gameState = "PlayerSelectLetter";
			break;
			case "PlayerSelectLetter":
			if (audioPlayIntro){
				AudioSource audioIntro = gameObject.GetComponent<AudioSource>();
				if (!audioIntro.isPlaying){
					playLetterAudio(currentDisplayLetter);
					audioPlayIntro = false;
				}
			}
			break;
			case "AnimationBreak":
			UpdateScreenDisplay();
			StartAnimation(AnimationBreakNumber);
			gameState = "AnimationBreakWait";
			break;
			
		}
    }
}
