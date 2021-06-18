# -*- coding: utf-8 -*-
"""
Created on Tue May 18 15:26:40 2021

@author: arthu
"""

# Import des modules nécessaire 
import pandas as pd 
from datetime import date
import time 


#Remplissage de la data frame 
df = pd.read_csv('Database_monde.csv', sep=';')
#Remplasse les NAN ( les cases vide dans la dataBase par des 0 )
df = df.fillna(0)


#Remplissage de différente data frame, pour récupérer les données importante
country = df['location']
mois = df['date']
new_cases = df['new_cases']
vaccinated = df['people_fully_vaccinated']
pop = df['population']
code = df['iso_code']
#print(df)

#conversion des dates
new_mois = pd.to_datetime(mois)


#Création dataframe final
#df_NewCase = pd.DataFrame(columns=['Location','Date','Pourcentage', 'code'])
#print(df_NewCase)
        # Le pd.dataframe permet de définir le type de la variable ainsi que le titre de chaque colonne
#df_Vaccined = pd.DataFrame(columns=['Location','Date','Pourcentage', 'code'])
#print(df_NewCase)

df_Country = pd.DataFrame()
df_Date = pd.DataFrame()

df_CDV =pd.DataFrame(columns=(['country','date','vaccination','isocode']))
df_CDC = pd.DataFrame(columns=(['country','date','newcases','isocode']))

"""
for y in range(1, len(new_mois)-1):
    print (code[y])
"""

sommeCase=new_cases[0]
            
for y in range(1, len(new_mois)-1):
    if country[y] == country[y-1]:
        if new_mois[y].year == new_mois[y-1].year:
            #calcul des sommes 
            if new_mois[y].month == new_mois[y+1].month:
                if new_cases[y]<0:
                    new_cases[y]=0
                    sommeCase += new_cases[y]
                else : 
                    sommeCase+= new_cases[y]
            else : 
                if new_cases[y]<0:
                    new_cases[y]=0
                    sommeCase += new_cases[y]
                    df_CDV = df_CDV.append(pd.DataFrame([[country[y],new_mois[y],vaccinated[y]/ pop[y]*100000, code[y]]], columns=(df_CDV.columns)))
                    df_CDC = df_CDC.append(pd.DataFrame([[country[y],new_mois[y],sommeCase/ pop[y]*100000, code[y]]], columns=(df_CDC.columns)))
                    sommeCase =0
                else:
                    sommeCase += new_cases[y]
                    df_CDV = df_CDV.append(pd.DataFrame([[country[y],new_mois[y],vaccinated[y]/ pop[y]*100000, code[y]]], columns=(df_CDV.columns)))
                    df_CDC = df_CDC.append(pd.DataFrame([[country[y],new_mois[y],sommeCase/ pop[y]*100000, code[y]]], columns=(df_CDC.columns)))
                    sommeCase =0

    else : 
        
        if new_mois[y].year == new_mois[y-1].year:
            #calcul des sommes 
            if new_mois[y].month == new_mois[y+1].month:
                if new_cases[y]<0:
                    new_cases[y]=0
                    sommeCase += new_cases[y]
                else : 
                    sommeCase+= new_cases[y]
                    
            else : 
                if new_cases[y]<0:
                    new_cases[y]=0
                    sommeCase += new_cases[y]
                    df_CDV = df_CDV.append(pd.DataFrame([[country[y],new_mois[y],vaccinated[y]/ pop[y]*100000, code[y]]], columns=(df_CDV.columns)))
                    df_CDC = df_CDC.append(pd.DataFrame([[country[y],new_mois[y],sommeCase/ pop[y]*100000, code[y]]], columns=(df_CDC.columns)))
                    sommeCase =0
                else:
                    sommeCase += new_cases[y]
                    df_CDV = df_CDV.append(pd.DataFrame([[country[y],new_mois[y],vaccinated[y]/ pop[y]*100000, code[y]]], columns=(df_CDV.columns)))
                    df_CDC = df_CDC.append(pd.DataFrame([[country[y],new_mois[y],sommeCase/ pop[y]*100000, code[y]]], columns=(df_CDC.columns)))
                    sommeCase =0
                 
df_CDC = df_CDC.reset_index(drop=True)

#isoler le max dans la colonne nouveaux cas pour pouvoir faire l'échelle sur la carte
#val = df_CDC['Nouveau Cas']
#maximum = df_CDC['Nouveau Cas'].max()
#print(maximum)


df_CDV.to_csv('VaccinationPour100.000.csv', index=False, header=True, sep=';')
df_CDC.to_csv('NewCasPour100.000.csv', index=False, header=True, sep=';')




