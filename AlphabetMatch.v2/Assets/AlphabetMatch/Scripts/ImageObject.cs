using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class ImageObject : MonoBehaviour
{
	public Image gridImage;
	
	public bool followCharacter1Flag;
	public bool followCharacter2Flag;
	
	public Transform Character1Obj;
	public Transform Character2Obj;
	
	// Start is called before the first frame update
    void Start()
    {
        followCharacter1Flag = false;
		followCharacter2Flag = false;
    }

    // Update is called once per frame
    void FixedUpdate()
    {
        if (followCharacter1Flag){
			transform.localPosition = new Vector3(Character1Obj.localPosition.x, Character1Obj.localPosition.y, Character1Obj.localPosition.z);
		}
		if (followCharacter2Flag){
			transform.localPosition = new Vector3(Character2Obj.localPosition.x, Character2Obj.localPosition.y, Character2Obj.localPosition.z);
		}
    }
	
	// --------------------   Load/Display Images  --------------------------//
	
	// get image filename 
	public void DisplayWordImage(string _filename){
		char letter = _filename[0];
		string imageFilename = "Objects/Images/letter" + letter + "/" + _filename;
		Debug.Log(imageFilename);
		gridImage.sprite = Resources.Load<Sprite>(imageFilename);
	}
	
	public void ClearWordImage(){
		string imageFilename = "Objects/Images/empty.png";
		Debug.Log(imageFilename);
		gridImage.sprite = Resources.Load<Sprite>(imageFilename);
	}
	
}
