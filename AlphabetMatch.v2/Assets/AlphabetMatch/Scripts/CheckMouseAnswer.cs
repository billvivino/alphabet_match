using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;// Required when using Event data.

public class CheckMouseAnswer :MonoBehaviour
{
    
	// Start is called before the first frame update
    void Start()
    {
        GetComponent<Image>().enabled = false;
		GetComponent<Button>().onClick.AddListener(TaskOnClick);
	}

	void TaskOnClick(){
		GetComponent<Image>().enabled = true;
    }
	
}
