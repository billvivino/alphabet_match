using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class GridObject : MonoBehaviour
{
    public string gridLetter;
	public string gridWord;
	
	public Image gridImage;
	public TextMeshProUGUI gridText;
	
	// Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        
    }
	
	// --------------------   Load/Display Images  --------------------------//
	
	// get image filename 
	public void DisplayWordImage(string _filename){
		char letter = _filename[0];
		string imageFilename = "Objects/Images/letter" + letter + "/" + _filename;
		Debug.Log(imageFilename);
		gridImage.sprite = Resources.Load<Sprite>(imageFilename);
	}
	
	// --------------------   Load/Display Test Field  ----------------------//
	
	public void DisplayWordText(string _word){
		int textStringLength = _word.Length-1;
		gridText.text = FormatDisplayText(_word);
		// resize font based on text string length
		gridText.fontSize = 32;
		if (textStringLength>7){
			gridText.fontSize = 26;
		}
		if (textStringLength>10){
			gridText.fontSize = 22;
		}
		if (textStringLength>17){
			gridText.fontSize = 18;
		}
	}
	
	private string FormatDisplayText(string _word){
		string wordText = _word.ToLower();
		int textStringLength = wordText.Length-1;
		string textEnd = wordText.Substring(1,textStringLength);
		string displayText = "<color=#FF0000>";
		displayText += _word.Substring(0,1).ToUpper();
		displayText += "</color>";
		displayText += textEnd;
		return displayText;
	}
}
