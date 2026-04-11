#!/usr/bin/env python3
"""Build complete candidates-2026.json from all sources.
- Kerala: existing data in candidates-2026.json
- Assam & Puducherry: hardcoded from Wikipedia scrape (WebFetch)
- Tamil Nadu & West Bengal: parsed from scripts/parsed-candidates-raw.json
"""

import json
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def build_assam():
    """126 constituencies — data from Wikipedia 2026 Assam Legislative Assembly election.
    Alliances: NDA (BJP+AGP+BPF), ASOM (INC+CPI(M)+others), plus notable others (RD, AJP, APHLC)."""
    data = {
        "1": {"ac_name": "Gossaigaon", "district": "Kokrajhar", "nda": {"candidate": "Sabharam Basumatary", "party": "BPF"}, "asom": {"candidate": "Joseph Hasda", "party": "INC"}},
        "2": {"ac_name": "Dotma", "district": "Kokrajhar", "nda": {"candidate": "Rabiram Narzary", "party": "BPF"}, "asom": {"candidate": "Birkhang Boro", "party": "INC"}},
        "3": {"ac_name": "Kokrajhar", "district": "Kokrajhar", "nda": {"candidate": "Sewli Mohilary", "party": "BPF"}, "asom": {"candidate": "Manik Chandra Brahma", "party": "INC"}},
        "4": {"ac_name": "Baokhungri", "district": "Kokrajhar", "nda": {"candidate": "Rupam Roy", "party": "BPF"}, "asom": {"candidate": "Sapali Marak", "party": "INC"}},
        "5": {"ac_name": "Parbatjhora", "district": "Kokrajhar", "nda": {"candidate": "Rezaul Karim", "party": "BPF"}, "asom": {"candidate": "Md Ashraful Islam Sheikh", "party": "INC"}},
        "6": {"ac_name": "Golakganj", "district": "Dhubri", "nda": {"candidate": "Ashwini Roy Sarkar", "party": "BJP"}, "asom": {"candidate": "Kartik Chandra Ray", "party": "INC"}},
        "7": {"ac_name": "Gauripur", "district": "Dhubri", "nda": {"candidate": "Mehtabul Haque", "party": "AGP"}, "asom": {"candidate": "Abdus Sobahan Ali Sarkar", "party": "INC"}},
        "8": {"ac_name": "Dhubri", "district": "Dhubri", "nda": {"candidate": "Uttam Prasad", "party": "BJP"}, "asom": {"candidate": "Baby Begum", "party": "INC"}},
        "9": {"ac_name": "Birsing Jarua", "district": "Dhubri", "nda": {"candidate": "Madhavi Das", "party": "BJP"}, "asom": {"candidate": "Wazed Ali Choudhury", "party": "INC"}},
        "10": {"ac_name": "Bilasipara", "district": "Dhubri", "nda": {"candidate": "Jibesh Rai", "party": "AGP"}, "asom": {"candidate": "Amrit Badsha", "party": "INC"}},
        "11": {"ac_name": "Mankachar", "district": "South Salmara-Mankachar", "nda": {"candidate": "Zabed Islam", "party": "AGP"}, "asom": {"candidate": "Mohibur Rohman", "party": "INC"}},
        "12": {"ac_name": "Jaleshwar", "district": "Goalpara", "nda": {"candidate": "Abu Sha Shadi Hossain", "party": "AGP"}, "asom": {"candidate": "Aftab Uddin Mollah", "party": "INC"}},
        "13": {"ac_name": "Goalpara West", "district": "Goalpara", "nda": {"candidate": "Pabitra Rabha", "party": "BJP"}, "asom": {"candidate": "Markline Marak", "party": "INC"}},
        "14": {"ac_name": "Goalpara East", "district": "Goalpara", "nda": {"candidate": "Abdur Rahim Zibran", "party": "AGP"}, "asom": {"candidate": "Abul Kalam Rasheed Alam", "party": "INC"}},
        "15": {"ac_name": "Dudhnai", "district": "Goalpara", "nda": {"candidate": "Tankeshwar Rabha", "party": "BJP"}, "asom": {"candidate": "Kishor Kumar Brahma", "party": "INC"}},
        "16": {"ac_name": "Abhayapuri", "district": "Bongaigaon", "nda": {"candidate": "Bhupen Roy", "party": "BJP"}, "asom": {"candidate": "Pradip Sarkar", "party": "INC"}},
        "17": {"ac_name": "Srijangram", "district": "Bongaigaon", "nda": {"candidate": "Shahidul Islam", "party": "AGP"}, "asom": {"candidate": "Nurul Islam", "party": "INC"}},
        "18": {"ac_name": "Bongaigaon", "district": "Bongaigaon", "nda": {"candidate": "Diptimayee Choudhury", "party": "AGP"}, "asom": {"candidate": "Girish Baruah", "party": "INC"}},
        "19": {"ac_name": "Sidli-Chirang", "district": "Chirang", "nda": {"candidate": "Paniram Brahma", "party": "BPF"}, "asom": {"candidate": "Matilal Narzary", "party": "INC"}},
        "20": {"ac_name": "Bijni", "district": "Chirang", "nda": {"candidate": "Arup Kumar Dey", "party": "BJP"}, "asom": {"candidate": "Rajat Kanti Saha", "party": "INC"}},
        "21": {"ac_name": "Bhowanipur-Sorbhog", "district": "Bajali", "nda": {"candidate": "Ranjeet Kumar Dass", "party": "BJP"}, "asom": {"candidate": "Manoranjan Talukdar", "party": "CPI(M)"}},
        "22": {"ac_name": "Mandia", "district": "Barpeta", "nda": {"candidate": "Badal Chandra Arya", "party": "BJP"}, "asom": {"candidate": "Abdul Khaleque", "party": "INC"}},
        "23": {"ac_name": "Chenga", "district": "Barpeta", "nda": {"candidate": "Saddam Hussein", "party": "AGP"}, "asom": {"candidate": "Abdul Rahim Ahmed", "party": "INC"}},
        "24": {"ac_name": "Barpeta", "district": "Barpeta", "nda": {"candidate": "Kumar Deepak Das", "party": "AGP"}, "asom": {"candidate": "", "party": ""}},
        "25": {"ac_name": "Pakabetbari", "district": "Barpeta", "nda": {"candidate": "Tara Prasad Das", "party": "AGP"}, "asom": {"candidate": "Jakir Hussain Sikdar", "party": "INC"}},
        "26": {"ac_name": "Bajali", "district": "Bajali", "nda": {"candidate": "Dharmeshwar Roy", "party": "AGP"}, "asom": {"candidate": "Dilip Baruah", "party": "AJP"}},
        "27": {"ac_name": "Chamaria", "district": "Kamrup", "nda": {"candidate": "Nurul Islam", "party": "AGP"}, "asom": {"candidate": "Rekibuddin Ahmed", "party": "INC"}},
        "28": {"ac_name": "Boko-Chaygaon", "district": "Kamrup", "nda": {"candidate": "Raju Mech", "party": "BJP"}, "asom": {"candidate": "Ramen Singh Rabha", "party": "INC"}},
        "29": {"ac_name": "Palasbari", "district": "Kamrup", "nda": {"candidate": "Himangshu Shekhar Baishya", "party": "BJP"}, "asom": {"candidate": "Pankaj Lochan Goswami", "party": "AJP"}},
        "30": {"ac_name": "Hajo-Sualkuchi", "district": "Kamrup", "nda": {"candidate": "Prakash Chandra Das", "party": "AGP"}, "asom": {"candidate": "Nandita Das", "party": "INC"}},
        "31": {"ac_name": "Rangiya", "district": "Kamrup", "nda": {"candidate": "Bhabesh Kalita", "party": "BJP"}, "asom": {"candidate": "Pranjit Choudhary", "party": "INC"}},
        "32": {"ac_name": "Kamalpur", "district": "Kamrup", "nda": {"candidate": "Diganta Kalita", "party": "BJP"}, "asom": {"candidate": "Satyabrat Kalita", "party": "INC"}},
        "33": {"ac_name": "Dispur", "district": "Kamrup Metropolitan", "nda": {"candidate": "Pradyut Bordoloi", "party": "BJP"}, "asom": {"candidate": "Mira Borthakur Goswami", "party": "INC"}},
        "34": {"ac_name": "Dimoria", "district": "Kamrup Metropolitan", "nda": {"candidate": "Dr. Tapan Das", "party": "AGP"}, "asom": {"candidate": "Kishor Kumar Baruah", "party": "INC"}},
        "35": {"ac_name": "New Guwahati", "district": "Kamrup Metropolitan", "nda": {"candidate": "Diplu Ranjan Sarmah", "party": "BJP"}, "asom": {"candidate": "Shantunu Borah", "party": "INC"}},
        "36": {"ac_name": "Guwahati Central", "district": "Kamrup Metropolitan", "nda": {"candidate": "Vijay Kumar Gupta", "party": "BJP"}, "asom": {"candidate": "Kunki Chaudhary", "party": "AJP"}},
        "37": {"ac_name": "Jalukbari", "district": "Kamrup Metropolitan", "nda": {"candidate": "Himanta Biswa Sarma", "party": "BJP"}, "asom": {"candidate": "Bidisha Neog", "party": "INC"}},
        "38": {"ac_name": "Barkhetri", "district": "Nalbari", "nda": {"candidate": "Narayan Deka", "party": "BJP"}, "asom": {"candidate": "Diganta Barman", "party": "INC"}},
        "39": {"ac_name": "Nalbari", "district": "Nalbari", "nda": {"candidate": "Jayanta Malla Baruah", "party": "BJP"}, "asom": {"candidate": "Ashok Kumar Sarma", "party": "INC"}},
        "40": {"ac_name": "Tihu", "district": "Nalbari", "nda": {"candidate": "Chandra Mohan Patowary", "party": "BJP"}, "asom": {"candidate": "Ratul Patuwary", "party": "INC"}},
        "41": {"ac_name": "Manas", "district": "Baksa", "nda": {"candidate": "Thaneswar Basumatary", "party": "BPF"}, "asom": {"candidate": "Anjan Talukdar", "party": "RD"}},
        "42": {"ac_name": "Baksa", "district": "Baksa", "nda": {"candidate": "Maneswar Brahma", "party": "BPF"}, "asom": {"candidate": "Jagadish Madahi", "party": "INC"}},
        "43": {"ac_name": "Tamulpur", "district": "Tamulpur", "nda": {"candidate": "Biswajit Daimary", "party": "BJP"}, "asom": {"candidate": "Rafie Daimary", "party": "INC"}},
        "44": {"ac_name": "Goreshwar", "district": "Tamulpur", "nda": {"candidate": "Victor Kumar Das", "party": "BJP"}, "asom": {"candidate": "Bapu Ram Boro", "party": "CPI(M)"}},
        "45": {"ac_name": "Bhergaon", "district": "Udalguri", "nda": {"candidate": "Maheswar Baro", "party": "BPF"}, "asom": {"candidate": "Anchula Gwara Daimary", "party": "INC"}},
        "46": {"ac_name": "Udalguri", "district": "Udalguri", "nda": {"candidate": "Rihon Daimary", "party": "BPF"}, "asom": {"candidate": "Soren Daimari", "party": "INC"}},
        "47": {"ac_name": "Majbat", "district": "Udalguri", "nda": {"candidate": "Charan Boro", "party": "BPF"}, "asom": {"candidate": "Narayan Adhikari", "party": "INC"}},
        "48": {"ac_name": "Tangla", "district": "Udalguri", "nda": {"candidate": "Bikan Chandra Deka", "party": "BJP"}, "asom": {"candidate": "Rohit Pariga", "party": "INC"}},
        "49": {"ac_name": "Sipajhar", "district": "Darrang", "nda": {"candidate": "Paramananda Rajbongshi", "party": "BJP"}, "asom": {"candidate": "Binanda Kumar Saikia", "party": "INC"}},
        "50": {"ac_name": "Mangaldai", "district": "Darrang", "nda": {"candidate": "Nilima Devi", "party": "BJP"}, "asom": {"candidate": "Rijumoni Talukdar", "party": "INC"}},
        "51": {"ac_name": "Dalgaon", "district": "Darrang", "nda": {"candidate": "Krishna Saha", "party": "BJP"}, "asom": {"candidate": "Ajijur Rahman", "party": "RD"}},
        "52": {"ac_name": "Jagiroad", "district": "Morigaon", "nda": {"candidate": "Pijush Hazarika", "party": "BJP"}, "asom": {"candidate": "Bubul Das", "party": "INC"}},
        "53": {"ac_name": "Laharighat", "district": "Morigaon", "nda": {"candidate": "Khalilur Rahaman", "party": "AGP"}, "asom": {"candidate": "Dr. Asif Mohamad Nazar", "party": "INC"}},
        "54": {"ac_name": "Morigaon", "district": "Morigaon", "nda": {"candidate": "Rama Kanta Dewri", "party": "BJP"}, "asom": {"candidate": "Bani Das", "party": "AJP"}},
        "55": {"ac_name": "Dhing", "district": "Nagaon", "nda": {"candidate": "Mukut Kumar Debnath", "party": "BJP"}, "asom": {"candidate": "Mehboob Mukhtar", "party": "RD"}},
        "56": {"ac_name": "Rupohihat", "district": "Nagaon", "nda": {"candidate": "Jakir Hussain Farazi", "party": "AGP"}, "asom": {"candidate": "Nurul Huda", "party": "INC"}},
        "57": {"ac_name": "Kaliabor", "district": "Nagaon", "nda": {"candidate": "Keshab Mahanta", "party": "AGP"}, "asom": {"candidate": "Pradip Kumar Baruah", "party": "RD"}},
        "58": {"ac_name": "Samaguri", "district": "Nagaon", "nda": {"candidate": "Anil Saikia", "party": "BJP"}, "asom": {"candidate": "Tanzil Hussain", "party": "INC"}},
        "59": {"ac_name": "Barhampur", "district": "Nagaon", "nda": {"candidate": "Jitu Goswami", "party": "BJP"}, "asom": {"candidate": "Rajen Gohain", "party": "AJP"}},
        "60": {"ac_name": "Nagaon-Batadraba", "district": "Nagaon", "nda": {"candidate": "Rupak Sarmah", "party": "BJP"}, "asom": {"candidate": "Dr. Durlav Chamua", "party": "INC"}},
        "61": {"ac_name": "Raha", "district": "Nagaon", "nda": {"candidate": "Sashi Kanta Das", "party": "BJP"}, "asom": {"candidate": "Utpal Bania", "party": "INC"}},
        "62": {"ac_name": "Binnakandi", "district": "Hojai", "nda": {"candidate": "Sahabuddin Mazumdar", "party": "AGP"}, "asom": {"candidate": "Rejaul Karim Chowdhury", "party": "AJP"}},
        "63": {"ac_name": "Hojai", "district": "Hojai", "nda": {"candidate": "Shiladitya Dev", "party": "BJP"}, "asom": {"candidate": "Jhilli Choudhury", "party": "INC"}},
        "64": {"ac_name": "Lumding", "district": "Hojai", "nda": {"candidate": "Sibu Misra", "party": "BJP"}, "asom": {"candidate": "Swapan Kar", "party": "INC"}},
        "65": {"ac_name": "Dhekiajuli", "district": "Sonitpur", "nda": {"candidate": "Ashok Singhal", "party": "BJP"}, "asom": {"candidate": "Batash Urang", "party": "INC"}},
        "66": {"ac_name": "Barchalla", "district": "Sonitpur", "nda": {"candidate": "Ritu Baran Sarmah", "party": "BJP"}, "asom": {"candidate": "Ripun Bora", "party": "INC"}},
        "67": {"ac_name": "Tezpur", "district": "Sonitpur", "nda": {"candidate": "Prithiraj Rava", "party": "AGP"}, "asom": {"candidate": "Alok Nath", "party": "RD"}},
        "68": {"ac_name": "Rangapara", "district": "Sonitpur", "nda": {"candidate": "Krishna Kamal Tanti", "party": "BJP"}, "asom": {"candidate": "Kartik Chandra Kurmi", "party": "INC"}},
        "69": {"ac_name": "Nadaur", "district": "Sonitpur", "nda": {"candidate": "Padma Hazarika", "party": "BJP"}, "asom": {"candidate": "Sunil Chetry", "party": "INC"}},
        "70": {"ac_name": "Biswanath", "district": "Biswanath", "nda": {"candidate": "Pallab Lochan Das", "party": "BJP"}, "asom": {"candidate": "Jayanta Borah", "party": "INC"}},
        "71": {"ac_name": "Behali", "district": "Biswanath", "nda": {"candidate": "Munindra Das", "party": "BJP"}, "asom": {"candidate": "Gyanendra Sarkar", "party": "CPI(ML)L"}},
        "72": {"ac_name": "Gohpur", "district": "Biswanath", "nda": {"candidate": "Utpal Borah", "party": "BJP"}, "asom": {"candidate": "Sankar Jyoti Kutum", "party": "INC"}},
        "73": {"ac_name": "Bihpuria", "district": "Lakhimpur", "nda": {"candidate": "Bhupen Kumar Borah", "party": "BJP"}, "asom": {"candidate": "Narayan Bhuyan", "party": "INC"}},
        "74": {"ac_name": "Rongonadi", "district": "Lakhimpur", "nda": {"candidate": "Rishiraj Hazarika", "party": "BJP"}, "asom": {"candidate": "Joyonto Khaund", "party": "INC"}},
        "75": {"ac_name": "Naoboicha", "district": "Lakhimpur", "nda": {"candidate": "Basanta Das", "party": "AGP"}, "asom": {"candidate": "Dr. Joy Prakash Das", "party": "INC"}},
        "76": {"ac_name": "Lakhimpur", "district": "Lakhimpur", "nda": {"candidate": "Manab Deka", "party": "BJP"}, "asom": {"candidate": "Ghana Buragohain", "party": "INC"}},
        "77": {"ac_name": "Dhakuakhana", "district": "Lakhimpur", "nda": {"candidate": "Naba Kumar Doley", "party": "BJP"}, "asom": {"candidate": "Ananda Narah", "party": "INC"}},
        "78": {"ac_name": "Dhemaji", "district": "Dhemaji", "nda": {"candidate": "Ranoj Pegu", "party": "BJP"}, "asom": {"candidate": "Sailen Sonowal", "party": "INC"}},
        "79": {"ac_name": "Sissiborgaon", "district": "Dhemaji", "nda": {"candidate": "Jiban Gogoi", "party": "BJP"}, "asom": {"candidate": "Dulal Chandra Barua", "party": "RD"}},
        "80": {"ac_name": "Jonai", "district": "Dhemaji", "nda": {"candidate": "Bhubon Pegu", "party": "BJP"}, "asom": {"candidate": "Raj Kumar Medak", "party": "INC"}},
        "81": {"ac_name": "Sadiya", "district": "Tinsukia", "nda": {"candidate": "Bolin Chetia", "party": "BJP"}, "asom": {"candidate": "Jagadish Bhuyan", "party": "AJP"}},
        "82": {"ac_name": "Doom Dooma", "district": "Tinsukia", "nda": {"candidate": "Rupesh Gowala", "party": "BJP"}, "asom": {"candidate": "Durga Bhumij", "party": "INC"}},
        "83": {"ac_name": "Margherita", "district": "Tinsukia", "nda": {"candidate": "Bhaskar Sharma", "party": "BJP"}, "asom": {"candidate": "Rahul Chetry", "party": "RD"}},
        "84": {"ac_name": "Digboi", "district": "Tinsukia", "nda": {"candidate": "Suren Phukan", "party": "BJP"}, "asom": {"candidate": "Dulal Moran", "party": "RD"}},
        "85": {"ac_name": "Makum", "district": "Tinsukia", "nda": {"candidate": "Sanjoy Kishan", "party": "BJP"}, "asom": {"candidate": "Sibanath Chetia", "party": "INC"}},
        "86": {"ac_name": "Tinsukia", "district": "Tinsukia", "nda": {"candidate": "Pulok Gohain", "party": "BJP"}, "asom": {"candidate": "Devid Phukan", "party": "INC"}},
        "87": {"ac_name": "Chabua-Lahowal", "district": "Dibrugarh", "nda": {"candidate": "Binod Hazarika", "party": "BJP"}, "asom": {"candidate": "Pranjal Ghatowar", "party": "INC"}},
        "88": {"ac_name": "Dibrugarh", "district": "Dibrugarh", "nda": {"candidate": "Prasanta Phukan", "party": "BJP"}, "asom": {"candidate": "Mounak Patra", "party": "AJP"}},
        "89": {"ac_name": "Khowang", "district": "Dibrugarh", "nda": {"candidate": "Chakradhar Gogoi", "party": "BJP"}, "asom": {"candidate": "Lurinjyoti Gogoi", "party": "AJP"}},
        "90": {"ac_name": "Duliajan", "district": "Dibrugarh", "nda": {"candidate": "Rameshwar Teli", "party": "BJP"}, "asom": {"candidate": "Dhruba Gogoi", "party": "INC"}},
        "91": {"ac_name": "Tingkhong", "district": "Dibrugarh", "nda": {"candidate": "Bimal Bora", "party": "BJP"}, "asom": {"candidate": "Bipul Gogoi", "party": "INC"}},
        "92": {"ac_name": "Naharkatia", "district": "Dibrugarh", "nda": {"candidate": "Taranga Gogoi", "party": "BJP"}, "asom": {"candidate": "Pranati Phukan", "party": "INC"}},
        "93": {"ac_name": "Sonari", "district": "Charaideo", "nda": {"candidate": "Dharmeswar Konwar", "party": "BJP"}, "asom": {"candidate": "Utpal Gogoi", "party": "INC"}},
        "94": {"ac_name": "Mahmora", "district": "Charaideo", "nda": {"candidate": "Suruj Dehingia", "party": "BJP"}, "asom": {"candidate": "Gyandip Mohan", "party": "INC"}},
        "95": {"ac_name": "Demow", "district": "Sibsagar", "nda": {"candidate": "Sushanta Borgohain", "party": "BJP"}, "asom": {"candidate": "Ajoy Kumar Gogoi", "party": "INC"}},
        "96": {"ac_name": "Sibsagar", "district": "Sibsagar", "nda": {"candidate": "Kushal Dowari", "party": "BJP"}, "asom": {"candidate": "Akhil Gogoi", "party": "RD"}},
        "97": {"ac_name": "Nazira", "district": "Sibsagar", "nda": {"candidate": "Mayur Borgohain", "party": "BJP"}, "asom": {"candidate": "Debabrata Saikia", "party": "INC"}},
        "98": {"ac_name": "Majuli", "district": "Majuli", "nda": {"candidate": "Bhuban Gam", "party": "BJP"}, "asom": {"candidate": "Indraneel Pegu", "party": "INC"}},
        "99": {"ac_name": "Teok", "district": "Jorhat", "nda": {"candidate": "Bikash Saikia", "party": "AGP"}, "asom": {"candidate": "Pallabi Saikia Gogoi", "party": "INC"}},
        "100": {"ac_name": "Jorhat", "district": "Jorhat", "nda": {"candidate": "Hitendra Nath Goswami", "party": "BJP"}, "asom": {"candidate": "Gaurav Gogoi", "party": "INC"}},
        "101": {"ac_name": "Mariani", "district": "Jorhat", "nda": {"candidate": "Rupjyoti Kurmi", "party": "BJP"}, "asom": {"candidate": "Gyanashree Bora", "party": "RD"}},
        "102": {"ac_name": "Titabor", "district": "Jorhat", "nda": {"candidate": "Dhiraj Gowala", "party": "BJP"}, "asom": {"candidate": "Pran Kurmi", "party": "INC"}},
        "103": {"ac_name": "Golaghat", "district": "Golaghat", "nda": {"candidate": "Ajanta Neog", "party": "BJP"}, "asom": {"candidate": "Bitupan Saikia", "party": "INC"}},
        "104": {"ac_name": "Dergaon", "district": "Golaghat", "nda": {"candidate": "Mridul Kumar Dutta", "party": "BJP"}, "asom": {"candidate": "Sagorika Bora", "party": "INC"}},
        "105": {"ac_name": "Bokakhat", "district": "Golaghat", "nda": {"candidate": "Atul Bora", "party": "AGP"}, "asom": {"candidate": "Hari Prasad Saikia", "party": "RD"}},
        "106": {"ac_name": "Khumtai", "district": "Golaghat", "nda": {"candidate": "Mrinal Saikia", "party": "BJP"}, "asom": {"candidate": "Roselina Tirkey", "party": "INC"}},
        "107": {"ac_name": "Sarupathar", "district": "Golaghat", "nda": {"candidate": "Biswajit Phukan", "party": "BJP"}, "asom": {"candidate": "Jibon Chutia", "party": "AJP"}},
        "108": {"ac_name": "Bokajan", "district": "Karbi Anglong", "nda": {"candidate": "Surjya Rongphar", "party": "BJP"}, "asom": {"candidate": "Raton Engti", "party": "INC"}},
        "109": {"ac_name": "Howraghat", "district": "Karbi Anglong", "nda": {"candidate": "Lunsing Teron", "party": "BJP"}, "asom": {"candidate": "Sanjeeb Teron", "party": "INC"}},
        "110": {"ac_name": "Diphu", "district": "Karbi Anglong", "nda": {"candidate": "Niso Terangpi", "party": "BJP"}, "asom": {"candidate": "Jones Ingti Kathar", "party": "APHLC"}},
        "111": {"ac_name": "Rongkhang", "district": "West Karbi Anglong", "nda": {"candidate": "Tuliram Ronghang", "party": "BJP"}, "asom": {"candidate": "Augustine Enghee", "party": "INC"}},
        "112": {"ac_name": "Amri", "district": "West Karbi Anglong", "nda": {"candidate": "Habe Teron", "party": "BJP"}, "asom": {"candidate": "Bikram Hanse", "party": "APHLC"}},
        "113": {"ac_name": "Haflong", "district": "Dima Hasao", "nda": {"candidate": "Rupali Langthasa", "party": "BJP"}, "asom": {"candidate": "Nandita Garlosa", "party": "INC"}},
        "114": {"ac_name": "Lakhipur", "district": "Cachar", "nda": {"candidate": "Kaushik Rai", "party": "BJP"}, "asom": {"candidate": "Santi Kumar Saikia", "party": "INC"}},
        "115": {"ac_name": "Udharbond", "district": "Cachar", "nda": {"candidate": "Rajdeep Goala", "party": "BJP"}, "asom": {"candidate": "Ajit Singh", "party": "INC"}},
        "116": {"ac_name": "Katigorah", "district": "Cachar", "nda": {"candidate": "Kamalakhya Dey Purkayastha", "party": "BJP"}, "asom": {"candidate": "Amar Chand Jain", "party": "INC"}},
        "117": {"ac_name": "Borkhola", "district": "Cachar", "nda": {"candidate": "Kishor Nath", "party": "BJP"}, "asom": {"candidate": "Amit Kumar Kalwar", "party": "INC"}},
        "118": {"ac_name": "Silchar", "district": "Cachar", "nda": {"candidate": "Rajdeep Roy", "party": "BJP"}, "asom": {"candidate": "Abhijit Paul", "party": "INC"}},
        "119": {"ac_name": "Sonai", "district": "Cachar", "nda": {"candidate": "Karim Uddin Barbhuiya", "party": "AGP"}, "asom": {"candidate": "Aminul Haque Laskar", "party": "INC"}},
        "120": {"ac_name": "Dholai", "district": "Cachar", "nda": {"candidate": "Amiya Kanti Das", "party": "BJP"}, "asom": {"candidate": "Dhrubjyoti Purkayastha", "party": "INC"}},
        "121": {"ac_name": "Hailakandi", "district": "Hailakandi", "nda": {"candidate": "Milon Das", "party": "BJP"}, "asom": {"candidate": "Rahul Roy", "party": "INC"}},
        "122": {"ac_name": "Algapur-Katlicherra", "district": "Hailakandi", "nda": {"candidate": "Zakir Hussain Laskar", "party": "AGP"}, "asom": {"candidate": "Zubair Anam Mazumder", "party": "INC"}},
        "123": {"ac_name": "Karimganj North", "district": "Karimganj", "nda": {"candidate": "Subrata Bhattacharjee", "party": "BJP"}, "asom": {"candidate": "Jakaria Ahmed", "party": "INC"}},
        "124": {"ac_name": "Karimganj South", "district": "Karimganj", "nda": {"candidate": "Ekbal Hussain", "party": "AGP"}, "asom": {"candidate": "Aminur Rahid Choudhary", "party": "INC"}},
        "125": {"ac_name": "Patharkandi", "district": "Karimganj", "nda": {"candidate": "Krishnendu Paul", "party": "BJP"}, "asom": {"candidate": "Kartik Sena Sinha", "party": "INC"}},
        "126": {"ac_name": "Ram Krishna Nagar", "district": "Karimganj", "nda": {"candidate": "Bijoy Malakar", "party": "BJP"}, "asom": {"candidate": "Suruchi Roy", "party": "INC"}},
    }
    return data


def build_puducherry():
    """30 constituencies — data from Wikipedia 2026 Puducherry Legislative Assembly election.
    Alliances: NDA (AINRC+BJP), INDIA (INC+DMK), Others (TVK etc.)."""
    data = {
        "1": {"ac_name": "Mannadipet", "district": "Puducherry", "nda": {"candidate": "A. Namassivayam", "party": "BJP"}, "india": {"candidate": "T. P. R. Selvame", "party": "INC"}},
        "2": {"ac_name": "Thirubuvanai", "district": "Puducherry", "nda": {"candidate": "B. Kobiga", "party": "AINRC"}, "india": {"candidate": "P. Angalane", "party": "DMK"}},
        "3": {"ac_name": "Ossudu", "district": "Puducherry", "nda": {"candidate": "E. Theeppainthan", "party": "BJP"}, "india": {"candidate": "P. Karthikeyan", "party": "INC"}},
        "4": {"ac_name": "Mangalam", "district": "Puducherry", "nda": {"candidate": "N. Rangasamy", "party": "AINRC"}, "india": {"candidate": "S. S. Rangan", "party": "DMK"}},
        "5": {"ac_name": "Villianur", "district": "Puducherry", "nda": {"candidate": "Ravikumar", "party": "AINRC"}, "india": {"candidate": "R. Siva", "party": "DMK"}},
        "6": {"ac_name": "Ozhukarai", "district": "Puducherry", "nda": {"candidate": "K. Narayanasamy", "party": "AINRC"}, "india": {"candidate": "Selva. Pushpalatha", "party": "VCK"}},
        "7": {"ac_name": "Kadirkamam", "district": "Puducherry", "nda": {"candidate": "K. S. P. Ramesh", "party": "AINRC"}, "india": {"candidate": "P. Vadivelu", "party": "DMK"}},
        "8": {"ac_name": "Indira Nagar", "district": "Puducherry", "nda": {"candidate": "A. K. D. Arumugam", "party": "AINRC"}, "india": {"candidate": "N. Rajakumar", "party": "INC"}},
        "9": {"ac_name": "Thattanchavadi", "district": "Puducherry", "nda": {"candidate": "N. Rangasamy", "party": "AINRC"}, "india": {"candidate": "V. Vaithilingam", "party": "INC"}},
        "10": {"ac_name": "Kamaraj Nagar", "district": "Puducherry", "nda": {"candidate": "Jose Charles Martin", "party": "LJK"}, "india": {"candidate": "P. K. Devadoss", "party": "INC"}},
        "11": {"ac_name": "Lawspet", "district": "Puducherry", "nda": {"candidate": "V. P. Sivakolundhu", "party": "AINRC"}, "india": {"candidate": "M. Vaithianathan", "party": "INC"}},
        "12": {"ac_name": "Kalapet", "district": "Puducherry", "nda": {"candidate": "P. M. L. Kalyanasundaram", "party": "BJP"}, "india": {"candidate": "A. Senthil Ramesh", "party": "DMK"}},
        "13": {"ac_name": "Muthialpet", "district": "Puducherry", "nda": {"candidate": "Vaiyapuri Manikandan", "party": "AINRC"}, "india": {"candidate": "M. Rajendran", "party": "INC"}},
        "14": {"ac_name": "Raj Bhavan", "district": "Puducherry", "nda": {"candidate": "V. P. Ramalingame", "party": "BJP"}, "india": {"candidate": "Vignesh Kannan", "party": "DMK"}},
        "15": {"ac_name": "Oupalam", "district": "Puducherry", "nda": {"candidate": "A. Anbalagan", "party": "AIADMK"}, "india": {"candidate": "Annibal Kennedy", "party": "DMK"}},
        "16": {"ac_name": "Orleampeth", "district": "Puducherry", "nda": {"candidate": "A. Gandhi", "party": "AIADMK"}, "india": {"candidate": "S. Gopal", "party": "DMK"}},
        "17": {"ac_name": "Nellithope", "district": "Puducherry", "nda": {"candidate": "A. Jayakumar", "party": "LJK"}, "india": {"candidate": "V. Karthikeyan", "party": "DMK"}},
        "18": {"ac_name": "Mudaliarpet", "district": "Puducherry", "nda": {"candidate": "A. Johnkumar", "party": "BJP"}, "india": {"candidate": "L. Sambath", "party": "DMK"}},
        "19": {"ac_name": "Ariankuppam", "district": "Puducherry", "nda": {"candidate": "Aiyappan", "party": "AINRC"}, "india": {"candidate": "D. Vijayalakshmy", "party": "INC"}},
        "20": {"ac_name": "Manavely", "district": "Puducherry", "nda": {"candidate": "Embalam R. Selvam", "party": "BJP"}, "india": {"candidate": "R. K. R. Anantharaman", "party": "INC"}},
        "21": {"ac_name": "Embalam", "district": "Puducherry", "nda": {"candidate": "Mohamdaoss", "party": "AINRC"}, "india": {"candidate": "M. Kandaswamy", "party": "INC"}},
        "22": {"ac_name": "Nettapakkam", "district": "Puducherry", "nda": {"candidate": "Rajavelu", "party": "AINRC"}, "india": {"candidate": "P. Sadasivam", "party": "INC"}},
        "23": {"ac_name": "Bahour", "district": "Puducherry", "nda": {"candidate": "T. Thiagarajan", "party": "AINRC"}, "india": {"candidate": "R. Senthilkumar", "party": "DMK"}},
        "24": {"ac_name": "Nedungadu", "district": "Karaikal", "nda": {"candidate": "Chandira Priyanga", "party": "AINRC"}, "india": {"candidate": "Dinesh Kumar", "party": "INC"}},
        "25": {"ac_name": "Thirunallar", "district": "Karaikal", "nda": {"candidate": "G. N. S. Rajasekaran", "party": "BJP"}, "india": {"candidate": "R. Kamalakannan", "party": "INC"}},
        "26": {"ac_name": "Karaikal North", "district": "Karaikal", "nda": {"candidate": "P. R. N. Thirumurugan", "party": "AINRC"}, "india": {"candidate": "A. M. Ranjith", "party": "INC"}},
        "27": {"ac_name": "Karaikal South", "district": "Karaikal", "nda": {"candidate": "M. Arulmurugan", "party": "BJP"}, "india": {"candidate": "A. M. H. Nazeem", "party": "DMK"}},
        "28": {"ac_name": "Neravy T.R. Pattinam", "district": "Karaikal", "nda": {"candidate": "T. K. S. M. Meenatchisundaram", "party": "BJP"}, "india": {"candidate": "M. Nagathiyagarajan", "party": "DMK"}},
        "29": {"ac_name": "Mahe", "district": "Mahe", "nda": {"candidate": "A. Dineshan", "party": "BJP"}, "india": {"candidate": "Ramesh Parambath", "party": "INC"}},
        "30": {"ac_name": "Yanam", "district": "Yanam", "nda": {"candidate": "Malladi Krishna Rao", "party": "AINRC"}, "india": {"candidate": "Gollapalli Srinivas Ashok", "party": "INC"}},
    }
    return data


def main():
    # Load existing Kerala data
    existing_path = os.path.join(BASE, 'public', 'data', 'candidates-2026.json')
    with open(existing_path) as f:
        existing = json.load(f)

    kerala = existing['states']['KERALA']

    # Build Assam and Puducherry
    assam = build_assam()
    puducherry = build_puducherry()

    # Load parsed TN and WB
    parsed_path = os.path.join(BASE, 'scripts', 'parsed-candidates-raw.json')
    with open(parsed_path) as f:
        parsed = json.load(f)

    tn = parsed['TAMIL NADU']
    wb = parsed['WEST BENGAL']

    # Combine all
    result = {
        "states": {
            "KERALA": kerala,
            "ASSAM": assam,
            "PUDUCHERRY": puducherry,
            "TAMIL NADU": tn,
            "WEST BENGAL": wb,
        },
        "_alliances": {
            "KERALA": [
                {"key": "ldf", "label": "LDF", "color": "#e71d36"},
                {"key": "udf", "label": "UDF", "color": "#3b82f6"},
                {"key": "nda", "label": "NDA", "color": "#f97316"},
            ],
            "ASSAM": [
                {"key": "nda", "label": "NDA", "color": "#f97316"},
                {"key": "asom", "label": "ASOM", "color": "#19aaed"},
            ],
            "PUDUCHERRY": [
                {"key": "nda", "label": "NDA", "color": "#f97316"},
                {"key": "india", "label": "INDIA", "color": "#19aaed"},
            ],
            "TAMIL NADU": [
                {"key": "spa", "label": "SPA", "color": "#e71d36"},
                {"key": "aiadmk_plus", "label": "AIADMK+", "color": "#006633"},
            ],
            "WEST BENGAL": [
                {"key": "aitc", "label": "AITC+", "color": "#20C646"},
                {"key": "bjp", "label": "BJP", "color": "#f97316"},
                {"key": "lf", "label": "LF+", "color": "#e71d36"},
                {"key": "inc", "label": "INC", "color": "#19aaed"},
            ],
        }
    }

    # Validate counts
    for state, data in result['states'].items():
        print(f"{state}: {len(data)} constituencies")

    # Write
    out_path = os.path.join(BASE, 'public', 'data', 'candidates-2026.json')
    with open(out_path, 'w') as f:
        json.dump(result, f, separators=(',', ':'), ensure_ascii=False)
    print(f"\nWritten to {out_path}")
    print(f"File size: {os.path.getsize(out_path) / 1024:.1f} KB")


if __name__ == '__main__':
    main()
