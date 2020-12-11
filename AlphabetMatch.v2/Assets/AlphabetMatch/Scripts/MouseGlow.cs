using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;// Required when using Event data.

public class MouseGlow : MonoBehaviour, IPointerEnterHandler, IPointerExitHandler
{
    public GameObject GlowObj;

	void Start(){
		GlowObj.SetActive(false);
	}
	
	public void OnPointerEnter(PointerEventData eventData)
    {
        GlowObj.SetActive(true);
    }
	
	public void OnPointerExit(PointerEventData eventData)
    {
        GlowObj.SetActive(false);
    }
}
