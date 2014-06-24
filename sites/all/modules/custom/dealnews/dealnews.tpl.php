<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Document</title>
</head>
<body>
<table>
    <!-- cabecera -->
	<tr>
		<td>
			<table>
				<tr>
					<td>{{logo}}</td>
					<td>Come tour all the great deals!</td>
				</tr>
			</table>
		</td>
	</tr>
	<!-- menu negro -->
	<tr>
		<td>
			| <a href="#">LOCAL DEALS</a>| <a href="#">PRODUCTS</a> | <a href="#">GATEWAY</a>|
		</td>
	</tr>
	<!-- TITULO GATEWAY -->
	<tr>
		<td>GATEWAYS</td>
	</tr>
	<!-- LISTADO GATEWAY -->
	<tr>
		<td>
			{{listado_gateway}}
			<div>
				<a href="#">VIEW ALL GATEWAY DEALS</a>
			</div>
		</td>
	</tr>
	<!-- TITULO PRODUCTS -->
	<tr>
		<td>PRODUCTS</td>
	</tr>
	<!-- LISTADO PRODUCTS -->
	<tr>
		<td>
			{{listado_products}}
			<div>
				<a href="#">VIEW ALL PRODUCTS DEALS</a>
			</div>
		</td>
	</tr>
</table>
	
</body>
</html>