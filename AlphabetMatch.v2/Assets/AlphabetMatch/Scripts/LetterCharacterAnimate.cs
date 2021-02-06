using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class LetterCharacterAnimate : MonoBehaviour
{
    public GameLogic gameLogicObj;
	public GameObject[] Letterchars;
	
	// Start is called before the first frame update
    void Start()
    {
        HideCharacters();
    }

	public void HideCharacters(){
		for (int i=0;i<Letterchars.Length;i++){
			Letterchars[i].SetActive(false);
		}
	}
	
	public void ShowCharacter(int _charNum){
		HideCharacters();
		Letterchars[_charNum].SetActive(true);
	}
	
    // Update is called once per frame
    void Update()
    {
        
    }
}
